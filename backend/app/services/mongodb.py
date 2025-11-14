from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")

if not MONGODB_CONNECTION_STRING:
    raise ValueError("MONGODB_CONNECTION_STRING is not set")

# Create a new client and connect to the server
client: MongoClient = MongoClient(MONGODB_CONNECTION_STRING, server_api=ServerApi("1"))

# Send a ping to confirm a successful connection
try:
    client.admin.command("ping")
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)
