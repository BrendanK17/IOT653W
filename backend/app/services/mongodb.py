from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os
from typing import Any

load_dotenv()

# Environment flags
MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")
TESTING = os.getenv("TESTING", "0").lower() in ("1", "true", "yes")

# Create a client. When testing, prefer an in-memory mongomock client to avoid network calls.
# Use `Any` here so type checkers accept index access like `client[DB_NAME]` for both
# the real `MongoClient` and `mongomock.MongoClient`.
client: Any = MongoClient(MONGODB_CONNECTION_STRING, server_api=ServerApi("1"))
if TESTING:
    try:
        client.admin.command("ping")
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        raise ImportError(
            "mongomock is required for testing. Install dev dependencies (e.g. `poetry install --with dev`)."
        ) from e
else:
    if not MONGODB_CONNECTION_STRING:
        raise ValueError("MONGODB_CONNECTION_STRING is not set")

    # Create a real MongoDB client and verify connection
    client = MongoClient(MONGODB_CONNECTION_STRING, server_api=ServerApi("1"))
    try:
        client.admin.command("ping")
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(e)


# --- Climatiq Response Collection ---
DB_NAME = "iot653u_db"  # You can change this to your preferred DB name
CLIMATIQ_COLLECTION = "climatiq_responses"


def save_climatiq_response(query_params: dict, response: dict):
    """
    Save a Climatiq API response to MongoDB.
    Args:
        query_params: The parameters used for the API request (e.g., mode_of_transport, region, lca_activity)
        response: The API response to store
    """
    db = client[DB_NAME]
    collection = db[CLIMATIQ_COLLECTION]
    doc = {"query_params": query_params, "response": response}
    collection.insert_one(doc)


def get_latest_climatiq_response(query_params: dict):
    """
    Retrieve the latest Climatiq response for given query params from MongoDB.
    Args:
        query_params: The parameters used for the API request
    Returns:
        The latest matching response or None
    """
    db = client[DB_NAME]
    collection = db[CLIMATIQ_COLLECTION]
    # Find the most recent matching document
    doc = collection.find_one({"query_params": query_params}, sort=[("_id", -1)])
    return doc["response"] if doc else None
