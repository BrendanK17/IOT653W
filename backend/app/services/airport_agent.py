import json
import logging
import os
import re
import sys
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv

load_dotenv()

from app.services.ollama import ask_ollama_with_tools
from app.services.transport_prompt import get_prompt as get_transport_prompt
from app.services.airports import get_all_airports
from ollama import web_search, web_fetch


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

    The agent operates in a loop where the LLM can emit tool calls for web_search and web_fetch,
    or emit the final JSON array of transports.
    """
    prompt = get_transport_prompt()

    # System instruction that allows tool calls
    system_instruction = (
        "You are an expert assistant that can use web search tools to gather accurate information about ALL public transport routes from airports to city centers, including multiple modes like underground, train, bus, coach, etc.\n"
        "You have access to web_search and web_fetch tools.\n"
        "First, search for all major transport options from the airport to city center.\n"
        "Then, for each mode, gather detailed stop lists with coordinates and prices.\n"
        "Emit tool calls as needed.\n"
        "Once you have complete information for all modes, output ONLY a valid JSON array containing multiple transport objects.\n"
        "Do not include any text, prose, markdown, or explanations outside of JSON."
    )

    messages: List[Dict[str, str]] = [
        {"role": "system", "content": system_instruction},
        {"role": "user", "content": prompt + f"\nAirport: {iata.upper()}"},
    ]

    available_tools = {'web_search': web_search, 'web_fetch': web_fetch}

    for iteration in range(max_iters):
        response = ask_ollama_with_tools(model, messages, tools=[web_search, web_fetch], think=True)

        if response.message.thinking:
            print(f'Thinking: {response.message.thinking}')

        if response.message.content:
            print(f'Content: {response.message.content}')
            # Check if content is the final JSON array
            parsed = _extract_first_json(response.message.content)
            if _is_final_array(parsed):
                return parsed

        messages.append(response.message)

        if response.message.tool_calls:
            print(f'Tool calls: {response.message.tool_calls}')
            for tool_call in response.message.tool_calls:
                function_to_call = available_tools.get(tool_call.function.name)
                if function_to_call:
                    args = tool_call.function.arguments
                    result = function_to_call(**args)
                    print(f'Result: {str(result)[:200]}...')
                    # Truncate for context
                    messages.append({'role': 'tool', 'content': str(result)[:8000], 'tool_name': tool_call.function.name})
                else:
                    messages.append({'role': 'tool', 'content': f'Tool {tool_call.function.name} not found', 'tool_name': tool_call.function.name})
        else:
            # No tool calls, assume it's the final answer
            break

    # If we reach here, try to extract JSON from the last message
    last_content = messages[-1].get('content', '') if messages else ''
    parsed = _extract_first_json(last_content)
    if _is_final_array(parsed):
        return parsed
    raise ValueError("Failed to get valid transport data after max iterations")
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
