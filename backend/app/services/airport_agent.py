import json
import logging
import os
import re
import sys
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv

load_dotenv()

from app.services.ollama import ask_ollama
from app.services.transport_prompt import get_prompt as get_transport_prompt
from app.services.airports import get_all_airports


def _is_tool_call(obj: Any) -> bool:
    """Return True if parsed JSON looks like a tool call request.

    We accept several shapes for robustness. Typical expected shape is
    {"tool": "tavily_search", "query": "...", "limit": 5}
    """
    if not isinstance(obj, dict):
        return False
    if obj.get("tool") is not None:
        return True
    if obj.get("action") in ("search", "tavily_search", "tool_call"):
        return True
    if obj.get("type") == "tool_call":
        return True
    return False


def _is_final_array(obj: Any) -> bool:
    """Return True if the object is a final JSON array of transport entries."""
    if not isinstance(obj, list):
        return False
    # Expect list of dicts
    for item in obj:
        if not isinstance(item, dict):
            return False
    return True


def _sanitize_json(text: str) -> Optional[Any]:
    """Attempt to fix common JSON errors and return parsed result.
    
    Fixes include:
    - Removing trailing commas in objects/arrays
    - Wrapping bare values in an object if needed
    """
    if not isinstance(text, str):
        return None

    # Remove model control tokens like <|start|>assistant|> that some LLMs emit
    try:
        text = re.sub(r"<\|[^\|]+\|>", " ", text)
    except Exception:
        pass

    # Remove trailing commas before } or ]
    text = re.sub(r',\s*([}\]])', r'\1', text)

    try:
        return json.loads(text)
    except Exception:
        pass
    return None


def _extract_first_json(text: str) -> Optional[Any]:
    """Try to extract the first balanced JSON object or array from `text`.

    This is defensive: LLM responses sometimes include truncated or
    surrounding prose. We look for the first `{` or `[` and then find
    the matching closing bracket using a stack to handle nested JSON.
    """
    if not isinstance(text, str):
        return None
    # Remove model control tokens that may appear in Ollama responses
    try:
        text = re.sub(r"<\|[^\|]+\|>", " ", text)
    except Exception:
        pass
    text = text.strip()
    # Fast path: whole text is JSON (with sanitization)
    try:
        return json.loads(text)
    except Exception:
        # Try sanitizing common JSON issues
        sanitized = _sanitize_json(text)
        if sanitized is not None:
            return sanitized

    # Try to extract JSON inside triple-backtick fences (```json ... ``` or ``` ... ```)
    m = re.search(r"```(?:json\s*)?([\s\S]*?)```", text, flags=re.IGNORECASE)
    if m:
        candidate = m.group(1).strip()
        try:
            return json.loads(candidate)
        except Exception:
            # fall through to other heuristics
            pass

    # Try single backtick inline JSON `{"a":1}`
    m2 = re.search(r"`(\{[\s\S]*?\}|\[[\s\S]*?\])`", text)
    if m2:
        candidate = m2.group(1)
        try:
            return json.loads(candidate)
        except Exception:
            pass

    # Find first opening bracket
    first_pos = None
    for i, ch in enumerate(text):
        if ch in "[{":
            first_pos = i
            break
    if first_pos is None:
        return None

    open_ch = text[first_pos]
    close_ch = "]" if open_ch == "[" else "}"

    stack = []
    for i in range(first_pos, len(text)):
        ch = text[i]
        if ch == open_ch:
            stack.append(ch)
        elif ch == close_ch:
            if not stack:
                # unmatched
                continue
            stack.pop()
            if not stack:
                candidate = text[first_pos : i + 1]
                try:
                    return json.loads(candidate)
                except Exception:
                    # keep trying to find later balanced structures
                    continue
    return None


def run_airport_lookup(iata: str, model: str = "gpt-oss:120b", max_iters: int = 20) -> List[Dict[str, Any]]:
    """Run the agent loop for an airport and return final transport list.

    The agent operates in a loop where the LLM can emit ONE of TWO JSON responses:

    1. TOOL CALL (Search Request):
       {"action": "search", "queries": [{"id": "q1", "query": "...", "purpose": "..."}], "max_searches": N}
       The agent executes Tavily searches and returns results as JSON feedback.

    2. FINAL ANSWER (Transport Array):
       [{"iata": "XXX", "id": "...", "airport": "...", "name": "...", "mode": "...", "co2": null, "stops": [...]}]
       The agent validates and returns this array.

    The loop continues until the LLM emits a FINAL ANSWER array or max_iters is reached.
    """
    prompt = get_transport_prompt()

    # Add a strict JSON-only system instruction that explains the two response types.
    strict_system = (
        "You MUST output ONLY valid JSON. Every response must be a top-level JSON array containing transport objects.\n"
        "Do NOT emit any tool calls, search requests, or ask for external searches. The system will NOT execute external tools.\n"
        "Return the final JSON array directly using the schema provided in the prompt. Do NOT include any text, prose, markdown, or explanations. Only JSON."
    )

    messages: List[Dict[str, str]] = [
        {"role": "system", "content": strict_system},
        {"role": "system", "content": prompt},
        {"role": "user", "content": f"Airport: {iata.upper()}"},
    ]

    def _summarize_result(res: Any, top_n: int = 3) -> List[Dict[str, Any]]:
        """Return a compact summary list of top results from a tavily response.

        Each summary item contains: title, url, score, snippet (short preview).
        """
        out: List[Dict[str, Any]] = []
        try:
            if not isinstance(res, dict):
                return out
            hits = []
            for key in ("results", "items", "documents", "hits"):
                if key in res and isinstance(res[key], list):
                    hits = res[key]
                    break
            if not hits and isinstance(res, list):
                hits = res
            for item in hits[:top_n]:
                try:
                    title = item.get("title") or item.get("headline") or item.get("name") or ""
                    url = item.get("url") or item.get("link") or ""
                    score = item.get("score") if item.get("score") is not None else None
                    content = item.get("content") or item.get("snippet") or item.get("raw_content") or ""
                    snippet = (content[:300] + "...") if isinstance(content, str) and len(content) > 300 else content
                    out.append({"title": title, "url": url, "score": score, "snippet": snippet})
                except Exception:
                    continue
        except Exception:
            return out
        return out

    def _normalize_query(iata_code: str, raw_query: str) -> str:
        """Normalize queries to put city first and request a full list of stops.

        - If airport info is available in DB, prepend the city name.
        - Ensure the phrasing requests a full list of stops with coordinates and official fares.
        """
        q = (raw_query or "").strip()
        try:
            # Try to look up airport city from DB for nicer queries
            city = None
            try:
                docs = get_all_airports()
                for d in docs:
                    if isinstance(d, dict) and d.get("iata") and d.get("iata").upper() == iata_code.upper():
                        city = d.get("city") or d.get("name")
                        break
            except Exception:
                city = None

            if city:
                # If city not already at start, prepend it
                if not q.lower().startswith(city.lower()):
                    q = f"{city} {q}"

            # If query doesn't already ask for a full stop list, append guidance
            low = q.lower()
            if not ("full list" in low or "all stops" in low or "complete station" in low or "full stops" in low):
                q = q + " full list of stops with coordinates and official fares"
        except Exception:
            # Fallback: ensure basic guidance
            if not q:
                q = f"{iata_code} airport full list of stops with coordinates and official fares"
            elif "full list" not in q.lower():
                q = q + " full list of stops with coordinates and official fares"
        return q

    # NOTE: External tool calls (Tavily) are intentionally disabled for the
    # main agent flow. The model must produce the final JSON array directly
    # using its knowledge and the prompt. No proactive searches will be run.
    
    # Inform the LLM that external search summaries have been provided and
    # must be used when producing the final JSON.
    messages.append({
        "role": "system",
        "content": (
            "You have been given external search summaries and results in the conversation under the keys `search_summary` and `search_results`. "
            "NOTE: external search tools are disabled in this run; ignore any instructions to call external tools. Do NOT invent additional stops or pricing beyond what is reasonable. If information is missing, set fields to null."
        )
    })

    # Add an explicit user instruction to search first
    messages.append({
        "role": "user",
        "content": (
            f"For airport {iata.upper()}, you MUST first search for current information. "
            "Do NOT use your training data. Make tool calls to find:"
            "1. ALL transport modes (rail, underground, bus, coach)"
            "2. COMPLETE station lists for each route (all stops from airport to city center)"
            "3. Current official fares and pricing"
            "4. Accurate coordinates for all stations."
            "Start by emitting a search request JSON."
        )
    })

    for iteration in range(1, max_iters + 1):
        logging.info("Agent iteration %d for %s", iteration, iata)
        # Log the messages we're about to send to the LLM (truncated to avoid huge logs)
        try:
            logging.debug("Messages sent to LLM (truncated 4000 chars): %s", json.dumps(messages, indent=2)[:4000])
        except Exception:
            logging.debug("Messages preview unavailable (non-serializable content)")
        try:
            response_text = ask_ollama(model, messages)
        except Exception:
            logging.exception("LLM call failed on iteration %d", iteration)
            raise

        # Log raw response for debugging (first 1000 chars) - use INFO level so it's always visible
        logging.info("Raw LLM response (iter %d, len=%d): %s", iteration, len(response_text), response_text[:1000])

        # Try parse the LLM response as JSON. Be tolerant of extra text
        parsed = None
        try:
            parsed = json.loads(response_text)
        except Exception:
            parsed = _extract_first_json(response_text)

        # Some LLMs wrap a tool call under a top-level `tool_call` key. Unwrap it.
        try:
            if isinstance(parsed, dict) and parsed.get("tool_call") and isinstance(parsed.get("tool_call"), dict):
                logging.info("Unwrapping top-level 'tool_call' wrapper from LLM response")
                # preserve any top-level search_results for debugging by attaching to messages
                wrapper = parsed
                parsed = wrapper.get("tool_call")
                # also log if wrapper contained search_results/other keys
                other_keys = {k: v for k, v in wrapper.items() if k != "tool_call"}
                if other_keys:
                    try:
                        logging.debug("Tool wrapper contained extra keys: %s", json.dumps(other_keys)[:2000])
                    except Exception:
                        logging.debug("Tool wrapper contained extra keys (non-serializable)")
        except Exception:
            pass

        # Log parsed JSON (if any) for debugging
        try:
            logging.debug("LLM parsed JSON (pretty): %s", json.dumps(parsed, indent=2)[:4000])
        except Exception:
            logging.debug("Parsed JSON preview unavailable or not serializable")

        if parsed is None:
            logging.warning("LLM did not return parseable JSON on iteration %d. Full raw response:\n%s", iteration, response_text)
            # Provide increasingly strict instructions if the LLM keeps failing
            messages.append({
                "role": "assistant",
                "content": json.dumps({"error": "invalid_json", "text_excerpt": response_text[:2000]}),
            })

            if iteration < 3:
                messages.append({
                    "role": "user",
                    "content": (
                        "Please respond with either a tool-call JSON or a final JSON array. "
                        "Return only JSON. Do not include prose."
                    ),
                })
            else:
                # After a few failed tries, give a very strict minimal template
                messages.append({
                    "role": "user",
                    "content": (
                        "You must now ONLY respond with valid JSON. "
                        "If you want me to run searches, reply with: {\"tool\": \"tavily_search\", \"queries\": [{\"id\": \"q1\", \"query\": \"...\"}]}. "
                        "If you can answer directly, return a top-level JSON array like: [{\"iata\": \"LHR\", \"name\": \"Heathrow\", ... }]."
                    ),
                })
            continue

        logging.info("Parsed LLM output type=%s on iteration %d", type(parsed), iteration)

        # If final array, validate and return
        if _is_final_array(parsed):
            logging.info("=== FINAL ARRAY DETECTED on iteration %d ===", iteration)
            logging.info("Number of transport options: %d", len(parsed))
            for idx, transport in enumerate(parsed):
                stops_count = len(transport.get("stops", []))
                logging.info("Transport %d: %s (%s) with %d stops", idx + 1, transport.get("name"), transport.get("mode"), stops_count)
            return parsed

        # If the model emits a tool call, we do not execute external tools in
        # the main flow. Tell the model tools are disabled and ask it to
        # return the final JSON array directly.
        if _is_tool_call(parsed):
            logging.info("Model requested a tool call on iteration %d, but external tools are disabled. Parsed: %s", iteration, json.dumps(parsed, indent=2))
            messages.append({"role": "assistant", "content": json.dumps({"error": "tool_calls_disabled", "received": parsed})})
            messages.append({"role": "user", "content": "External search tools are disabled. Please return the FINAL JSON array of transports using only the prompt and your knowledge."})
            continue

        # Unknown JSON shape: ask LLM to clarify / produce either tool call or final array
        logging.warning("LLM returned unknown JSON shape on iteration %d: %s", iteration, type(parsed))
        logging.warning("Unknown shape details: %s", json.dumps(parsed, indent=2)[:500])
        messages.append({"role": "assistant", "content": json.dumps({"error": "unknown_shape", "received": parsed})})
        messages.append({"role": "user", "content": "Please produce either a tool-call JSON (e.g. {\"tool\": \"tavily_search\", \"query\": \"...\"}) or a final JSON array of transports."})

    # Fallback: generate a default/empty transport array so the system doesn't crash
    # Log the failure for investigation
    logging.error(
        "Agent failed to produce final JSON after %d iterations for %s. "
        "Returning empty fallback array. Last few messages:\n%s",
        max_iters,
        iata,
        json.dumps(messages[-3:], indent=2) if len(messages) >= 3 else json.dumps(messages, indent=2)
    )
    # Return an empty array instead of raising, so the API doesn't crash
    return []


def main(argv: Optional[List[str]] = None) -> None:
    if argv is None:
        argv = sys.argv[1:]
    if not argv:
        print("Usage: airport_agent.py <IATA>")
        return
    iata = argv[0]
    transports = run_airport_lookup(iata)
    print(json.dumps(transports, indent=2))


if __name__ == "__main__":
    main()
