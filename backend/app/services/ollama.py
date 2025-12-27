import os
from ollama import Client, chat, web_search, web_fetch
from dotenv import load_dotenv

load_dotenv()

OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY")
TESTING = os.getenv("TESTING", "0").lower() in ("1", "true", "yes")

if not TESTING and not OLLAMA_API_KEY:
    raise ValueError("OLLAMA_API_KEY is not set")


if TESTING:
    # In testing mode, use a dummy API key to avoid connection issues
    client = Client(
        host="https://ollama.com",
        headers={"Authorization": "Bearer dummy_key_for_testing"},
    )
else:
    if not OLLAMA_API_KEY:
        raise ValueError("OLLAMA_API_KEY is not set")
    client = Client(
        host="https://ollama.com", headers={"Authorization": "Bearer " + OLLAMA_API_KEY}
    )

messages = [
    {
        "role": "user",
        "content": "Why is the sky blue?",
    },
]


def ask_ollama(model: str, messages: list):
    """Send a chat request to Ollama and return the combined response."""
    if TESTING:
        # Return a mock response for testing
        return "Mock response for testing purposes"

    response = ""
    for part in client.chat(model, messages=messages, stream=True):
        response += part["message"]["content"]
    return response


def ask_ollama_with_tools(model: str, messages: list, tools=None, think=False):
    """Send a chat request to Ollama with tools and return the response."""
    if TESTING:
        # Return a mock response for testing
        return {"message": {"content": "Mock response for testing purposes", "tool_calls": None}}

    available_tools = {'web_search': web_search, 'web_fetch': web_fetch}
    if tools:
        available_tools.update({tool.__name__: tool for tool in tools if hasattr(tool, '__name__')})

    response = chat(
        model=model,
        messages=messages,
        tools=[web_search, web_fetch] if tools is None else tools,
        think=think
    )
    return response
