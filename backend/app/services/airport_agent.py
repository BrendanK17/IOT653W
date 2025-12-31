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
    text = re.sub(r",\s*([}\]])", r"\1", text)

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


def run_airport_lookup(
    iata: str, model: str = "gpt-oss:120b-cloud", max_iters: int = 20
) -> List[Dict[str, Any]]:
    """Run the agent loop for an airport and return final transport list.

    The agent operates in a loop where the LLM must emit a JSON response:

    FINAL ANSWER (Transport Array):
       [{"iata": "XXX", "id": "...", "airport": "...", "name": "...", "mode": "...", "co2": null, "stops": [...]}]
       The agent validates and returns this array.

    External tools are disabled; the LLM must produce the final JSON array directly.
    """
    prompt = get_transport_prompt()

    # Add a strict JSON-only system instruction that explains the response type.
    strict_system = (
        "You MUST output ONLY valid JSON. Every response must be a top-level JSON array containing transport objects.\n"
        "Return the final JSON array directly using the schema provided in the prompt. Do NOT include any text, prose, markdown, or explanations. Only JSON."
    )

    messages: List[Dict[str, str]] = [
        {"role": "system", "content": strict_system},
        {"role": "system", "content": prompt},
        {"role": "user", "content": f"Airport: {iata.upper()}"},
    ]

    # NOTE: External tool calls (Tavily) are intentionally disabled for the
    # main agent flow. The model must produce the final JSON array directly
    # using its knowledge and the prompt. No proactive searches will be run.

    # Inform the LLM that external search summaries have been provided and
    # must be used when producing the final JSON.
    messages.append(
        {
            "role": "system",
            "content": (
                "You have been given external search summaries and results in the conversation under the keys `search_summary` and `search_results`. "
                "NOTE: external search tools are disabled in this run; ignore any instructions to call external tools. Do NOT invent additional stops or pricing beyond what is reasonable. If information is missing, set fields to null."
            ),
        }
    )

    for iteration in range(1, max_iters + 1):
        logging.info("Agent iteration %d for %s", iteration, iata)
        # Log the messages we're about to send to the LLM (truncated to avoid huge logs)
        try:
            logging.debug(
                "Messages sent to LLM (truncated 4000 chars): %s",
                json.dumps(messages, indent=2)[:4000],
            )
        except Exception:
            logging.debug("Messages preview unavailable (non-serializable content)")
        try:
            response_text = ask_ollama(model, messages)
        except Exception:
            logging.exception("LLM call failed on iteration %d", iteration)
            raise

        # Log raw response for debugging (first 1000 chars) - use INFO level so it's always visible
        logging.info(
            "Raw LLM response (iter %d, len=%d): %s",
            iteration,
            len(response_text),
            response_text[:1000],
        )

        # Try parse the LLM response as JSON. Be tolerant of extra text
        parsed = None
        try:
            parsed = json.loads(response_text)
        except Exception:
            parsed = _extract_first_json(response_text)

        # Some LLMs wrap a tool call under a top-level `tool_call` key. Unwrap it.
        try:
            if (
                isinstance(parsed, dict)
                and parsed.get("tool_call")
                and isinstance(parsed.get("tool_call"), dict)
            ):
                logging.info(
                    "Unwrapping top-level 'tool_call' wrapper from LLM response"
                )
                # preserve any top-level search_results for debugging by attaching to messages
                wrapper = parsed
                parsed = wrapper.get("tool_call")
                # also log if wrapper contained search_results/other keys
                other_keys = {k: v for k, v in wrapper.items() if k != "tool_call"}
                if other_keys:
                    try:
                        logging.debug(
                            "Tool wrapper contained extra keys: %s",
                            json.dumps(other_keys)[:2000],
                        )
                    except Exception:
                        logging.debug(
                            "Tool wrapper contained extra keys (non-serializable)"
                        )
        except Exception:
            pass

        # Log parsed JSON (if any) for debugging
        try:
            logging.debug(
                "LLM parsed JSON (pretty): %s", json.dumps(parsed, indent=2)[:4000]
            )
        except Exception:
            logging.debug("Parsed JSON preview unavailable or not serializable")

        if parsed is None:
            logging.warning(
                "LLM did not return parseable JSON on iteration %d. Full raw response:\n%s",
                iteration,
                response_text,
            )
            # Provide increasingly strict instructions if the LLM keeps failing
            messages.append(
                {
                    "role": "assistant",
                    "content": json.dumps(
                        {"error": "invalid_json", "text_excerpt": response_text[:2000]}
                    ),
                }
            )

            if iteration < 3:
                messages.append(
                    {
                        "role": "user",
                        "content": (
                            "Please respond with a final JSON array. "
                            "Return only JSON. Do not include prose."
                        ),
                    }
                )
            else:
                # After a few failed tries, give a very strict minimal template
                messages.append(
                    {
                        "role": "user",
                        "content": (
                            "You must now ONLY respond with valid JSON. "
                            'Return a top-level JSON array like: [{"iata": "LHR", "name": "Heathrow", ... }].'
                        ),
                    }
                )
            continue

        logging.info(
            "Parsed LLM output type=%s on iteration %d", type(parsed), iteration
        )

        # If final array, validate and return
        if _is_final_array(parsed):
            logging.info("=== FINAL ARRAY DETECTED on iteration %d ===", iteration)
            logging.info("Number of transport options: %d", len(parsed))
            for idx, transport in enumerate(parsed):
                stops_count = len(transport.get("stops", []))
                logging.info(
                    "Transport %d: %s (%s) with %d stops",
                    idx + 1,
                    transport.get("name"),
                    transport.get("mode"),
                    stops_count,
                )
            return parsed

        # Unknown JSON shape: ask LLM to clarify / produce final array
        logging.warning(
            "LLM returned unknown JSON shape on iteration %d: %s",
            iteration,
            type(parsed),
        )
        logging.warning("Unknown shape details: %s", json.dumps(parsed, indent=2)[:500])
        messages.append(
            {
                "role": "assistant",
                "content": json.dumps({"error": "unknown_shape", "received": parsed}),
            }
        )
        messages.append(
            {
                "role": "user",
                "content": 'Please produce a final JSON array of transports.',
            }
        )

    # Fallback: generate a default/empty transport array so the system doesn't crash
    # Log the failure for investigation
    logging.error(
        "Agent failed to produce final JSON after %d iterations for %s. "
        "Returning empty fallback array. Last few messages:\n%s",
        max_iters,
        iata,
        (
            json.dumps(messages[-3:], indent=2)
            if len(messages) >= 3
            else json.dumps(messages, indent=2)
        ),
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
