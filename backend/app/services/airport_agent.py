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
from app.services.tavily import search as tavily_search, extract_snippets


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


def run_airport_lookup(iata: str, model: str = "gpt-oss:120b", max_iters: int = 8) -> List[Dict[str, Any]]:
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
        "You MUST output ONLY valid JSON. Every response must be exactly one of these two JSON structures:\n"
        "1. A search request: {\"action\": \"search\", \"queries\": [{\"id\": \"q1\", \"query\": \"...\", \"purpose\": \"...\"}], \"max_searches\": N}\n"
        "2. A final answer: [{\"iata\": \"...\", \"id\": \"...\", \"airport\": \"...\", \"name\": \"...\", \"mode\": \"...\", \"co2\": null, \"stops\": [...]}]\n"
        "Do NOT include any text, prose, markdown, or explanations. Only JSON."
    )

    messages: List[Dict[str, str]] = [
        {"role": "system", "content": strict_system},
        {"role": "system", "content": prompt},
        {"role": "user", "content": f"Airport: {iata.upper()}"},
    ]

    # Provide a concrete tool-call example to encourage the LLM to search FIRST.
    # DO NOT provide a final answer example yet - we want it to search first.
    try:
        example_tool_call = {
            "action": "search",
            "queries": [
                {
                    "id": "q1",
                    "query": f"{iata} airport all train rail underground bus coach routes to city center complete station lists",
                    "purpose": "identify all transport modes and operators"
                },
                {
                    "id": "q2",
                    "query": f"{iata} airport rail underground complete route station list all stops coordinates",
                    "purpose": "get complete station lists with coordinates for rail/underground routes"
                },
                {
                    "id": "q3",
                    "query": f"{iata} airport transport fares current prices official",
                    "purpose": "get current official pricing for all transport modes"
                }
            ],
            "max_searches": 6,
        }
        messages.append({"role": "assistant", "content": json.dumps(example_tool_call)})
    except Exception:
        # If for some reason json.dumps fails, don't block the loop.
        pass
    
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

        # If it's a tool call, execute and feed back results
        if _is_tool_call(parsed):
            logging.info("Detected tool call on iteration %d. Parsed object: %s", iteration, json.dumps(parsed, indent=2))
            tool_name = parsed.get("tool") or parsed.get("action")
            logging.info("Tool name: %s", tool_name)

            # Handle batch queries shape e.g. {"action":"search","queries":[{id,query,...},...]}
            queries = parsed.get("queries") if isinstance(parsed.get("queries"), list) else None
            if queries:
                logging.info("Found %d queries to execute", len(queries))
                feedback: Dict[str, Any] = {"tool_call": parsed, "search_results": {}}
                for q in queries:
                    if not isinstance(q, dict):
                        continue
                    qid = q.get("id") or q.get("qid") or q.get("name") or "q"
                    qtext = q.get("query") or q.get("q") or q.get("text")
                    qlimit = int(q.get("limit", 5) or 5)
                    if not qtext:
                        feedback["search_results"][qid] = {"error": "missing_query"}
                        continue
                    logging.info("=== EXECUTING TAVILY SEARCH ===")
                    logging.info("Query ID: %s", qid)
                    logging.info("Query Text: %s", qtext)
                    logging.info("Limit: %d", qlimit)
                    try:
                        tavily_result = tavily_search(qtext, limit=qlimit)
                        logging.info("Tavily search completed for qid=%s. Result type: %s, keys: %s", qid, type(tavily_result), list(tavily_result.keys()) if isinstance(tavily_result, dict) else "N/A")
                        # If the client returned the fallback (no config), mark it
                        if isinstance(tavily_result, dict) and tavily_result.get("fallback"):
                            logging.info("Tavily fallback used for qid=%s", qid)
                            feedback["search_results"][qid] = {"fallback": True, "raw": tavily_result}
                        # tavily_result may be an error payload
                        elif isinstance(tavily_result, dict) and tavily_result.get("error"):
                            logging.error("Tavily returned error for qid=%s: %s", qid, tavily_result.get("message"))
                            feedback["search_results"][qid] = {"error": tavily_result}
                        else:
                            snippets = extract_snippets(tavily_result)
                            feedback["search_results"][qid] = {"raw": tavily_result, "snippets": snippets}
                    except Exception:
                        logging.exception("Tavily search failed for query id=%s", qid)
                        feedback["search_results"][qid] = {"error": "tavily_error"}

                # Attach original parsed call and full results so LLM can synthesise
                # include the original query payload to help LLM debug
                logging.info("Sending search results feedback to LLM. Feedback keys: %s", list(feedback.keys()))
                logging.info("Search results summary: %s", {qid: "error" if res.get("error") else "success" for qid, res in feedback.get("search_results", {}).items()})
                try:
                    feedback_json = json.dumps(feedback)
                    logging.info("Feedback JSON length: %d chars", len(feedback_json))
                    messages.append({"role": "assistant", "content": feedback_json})
                except Exception:
                    logging.exception("Failed to append feedback json to messages")
                    messages.append({"role": "assistant", "content": str(feedback)})
                # If all queries either errored or returned a fallback, ask the LLM to produce a final answer anyway
                all_errors_or_fallback = True
                error_reports = []
                for qid, res in feedback.get("search_results", {}).items():
                    # If any result is a usable result (not error and not fallback), we are not in all-error state
                    if not (isinstance(res, dict) and (res.get("error") or res.get("fallback"))):
                        all_errors_or_fallback = False
                        break
                    # collect messages for debugging
                    if isinstance(res, dict) and res.get("fallback"):
                        msg = "fallback"
                    else:
                        err = res.get("error")
                        if isinstance(err, dict):
                            msg = err.get("message") or err.get("response_text") or str(err)
                        else:
                            msg = str(err)
                    error_reports.append({"id": qid, "message": msg})

                if all_errors_or_fallback:
                    logging.warning("All Tavily queries failed or fell back for %s: %s", iata, error_reports)
                    messages.append({
                        "role": "user",
                        "content": (
                            "All external searches failed or returned fallbacks: "
                            + json.dumps(error_reports)
                            + ". Please provide a final JSON array of transport options based on your knowledge and the prompt."
                        ),
                    })
                continue

            # Single query shapes
            if tool_name and "tavily" in str(tool_name).lower() or parsed.get("query") or parsed.get("q"):
                query = parsed.get("query") or parsed.get("q") or parsed.get("args", {}).get("query")
                limit = int(parsed.get("limit", parsed.get("args", {}).get("limit", 5) or 5))
                if not query:
                    messages.append({"role": "assistant", "content": json.dumps({"error": "missing_query"})})
                    messages.append({"role": "user", "content": "Tool call missing `query` field."})
                    continue

                logging.info("Performing Tavily search for query: %s", query)
                try:
                    tavily_result = tavily_search(query, limit=limit)
                    if isinstance(tavily_result, dict) and tavily_result.get("fallback"):
                        logging.info("Tavily fallback used for single query")
                        tool_feedback = {"tool_call": parsed, "search_results": {"fallback": True, "raw": tavily_result}}
                    elif isinstance(tavily_result, dict) and tavily_result.get("error"):
                        logging.error("Tavily returned error for single query: %s", tavily_result.get("message"))
                        tool_feedback = {"tool_call": parsed, "search_results": {"error": tavily_result}}
                    else:
                        snippets = extract_snippets(tavily_result)
                        tool_feedback = {"tool_call": parsed, "search_results": {"raw": tavily_result, "snippets": snippets}}
                except Exception:
                    logging.exception("Tavily search failed for query: %s", query)
                    tool_feedback = {"tool_call": parsed, "search_results": {"error": "tavily_error"}}

                try:
                    messages.append({"role": "assistant", "content": json.dumps(tool_feedback)})
                except Exception:
                    logging.exception("Failed to append tool feedback JSON to messages")
                    messages.append({"role": "assistant", "content": str(tool_feedback)})
                # If the single tool call returned an error or a fallback, prompt LLM to produce best-effort final array
                sr = tool_feedback.get("search_results")
                if isinstance(sr, dict) and (sr.get("error") or sr.get("fallback")):
                    logging.warning("Single Tavily call returned error/fallback for %s: %s", iata, sr.get("error") or sr.get("fallback"))
                    messages.append({
                        "role": "user",
                        "content": (
                            "The external search tool failed or was unavailable: " + json.dumps(sr.get("error") or {"fallback": True})
                            + ". Please provide a final JSON array of transport options based on your knowledge and the prompt."
                        ),
                    })
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
