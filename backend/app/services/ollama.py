import os
from ollama import Client

load_dotenv()

OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY")

if not OLLAMA_API_KEY:
    raise ValueError("OLLAMA_API_KEY is not set")

client = Client(
    host="https://ollama.com",
    headers={'Authorization': 'Bearer ' + os.environ.get('OLLAMA_API_KEY')}
)

messages = [
  {
    'role': 'user',
    'content': 'Why is the sky blue?',
  },
]

for part in client.chat('gpt-oss:120b', messages=messages, stream=True):
  print(part['message']['content'], end='', flush=True)