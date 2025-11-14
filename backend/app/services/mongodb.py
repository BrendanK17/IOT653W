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
    doc = {
        "query_params": query_params,
        "response": response
    }
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
