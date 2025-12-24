import os
from ollama import Client
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
