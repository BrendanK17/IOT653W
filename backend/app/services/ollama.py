import os
from ollama import Client
from dotenv import load_dotenv

load_dotenv()

OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY")

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
    response = ""
    for part in client.chat(model, messages=messages, stream=True):
        response += part["message"]["content"]
    return response
