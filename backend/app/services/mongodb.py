from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
from unittest.mock import MagicMock
from dotenv import load_dotenv

load_dotenv()

# Environment flags
TESTING = os.getenv("TESTING", "0").lower() in ("1", "true", "yes")
MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")

if not TESTING and not MONGODB_CONNECTION_STRING:
    raise ValueError("MONGODB_CONNECTION_STRING is not set")

# Create a real MongoDB client and verify connection
if not TESTING:
    client: MongoClient = MongoClient(
        MONGODB_CONNECTION_STRING, server_api=ServerApi("1")
    )
    try:
        client.admin.command("ping")
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(e)
else:
    # In testing, use a mock client
    client = MagicMock()


# --- Climatiq Response Collection ---
DB_NAME = "iot653u_db"  # You can change this to your preferred DB name
CLIMATIQ_COLLECTION = "climatiq_responses"

# --- Climatiq Activity IDs Collection ---
CLIMATIQ_IDS_COLLECTION = "climatiq_activity_ids"

# --- Country Regions Collection ---
COUNTRY_REGIONS_COLLECTION = "country_regions"

# --- Airport city distance mapping collection ---
AIRPORT_DISTANCE_COLLECTION = "airport_city_distances"

# --- Transport mode -> Climatiq activity mapping collection ---
TRANSPORT_ACTIVITY_MAPPING_COLLECTION = "transport_activity_mapping"


def save_activity_ids(location: str, activity_ids: list):
    """
    Save activity IDs for a location to MongoDB.
    Args:
        location: The location key (e.g., "GB")
        activity_ids: List of activity IDs
    """
    db = client[DB_NAME]
    collection = db[CLIMATIQ_IDS_COLLECTION]
    # Store as a plain list of activity_id strings.
    normalized: list[str] = []
    for item in activity_ids or []:
        if isinstance(item, str):
            if item.strip():
                normalized.append(item.strip())
            continue

        # Backward-compatible: accept old formats like {activity_id, region}
        if isinstance(item, dict):
            aid = item.get("activity_id") or item.get("id") or item.get("activityId")
            if isinstance(aid, str) and aid.strip():
                normalized.append(aid.strip())

    # Deduplicate while preserving order
    normalized = list(dict.fromkeys(normalized))

    # Upsert: update if exists, insert if not
    collection.update_one(
        {"location": location}, {"$set": {"activity_ids": normalized}}, upsert=True
    )


def get_activity_ids(location: str):
    """
    Retrieve activity IDs for a location from MongoDB.
    Args:
        location: The location key (e.g., "GB")
    Returns:
        List of activity IDs or empty list
    """
    db = client[DB_NAME]
    collection = db[CLIMATIQ_IDS_COLLECTION]
    doc = collection.find_one({"location": location})
    if not doc:
        return []
    # Return as list[str]. Backward-compatible with old stored object format.
    items = doc.get("activity_ids", []) or []
    normalized: list[str] = []
    for it in items:
        if isinstance(it, str):
            if it.strip():
                normalized.append(it.strip())
            continue
        if isinstance(it, dict):
            aid = it.get("activity_id") or it.get("id") or it.get("activityId")
            if isinstance(aid, str) and aid.strip():
                normalized.append(aid.strip())

    return list(dict.fromkeys(normalized))


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


def get_all_climatiq_responses():
    """
    Retrieve all documents from the climatiq_responses collection.
    Returns a list of documents with `_id` converted to string for JSON serialization.
    """
    db = client[DB_NAME]
    collection = db[CLIMATIQ_COLLECTION]
    docs = list(collection.find({}))
    results = []
    for d in docs:
        # convert BSON ObjectId to string for JSON friendliness
        doc = dict(d)
        _id = doc.get("_id")
        if _id is not None:
            try:
                doc["_id"] = str(_id)
            except Exception:
                pass
        results.append(doc)
    return results


def find_latest_climatiq_doc(
    *,
    activity_id: str,
    source_lca_activity: str,
    passengers: int,
    distance: int,
    distance_unit: str = "km",
    region: str | None = None,
):
    """Find the latest raw Climatiq document matching the given query params.

    Notes:
    - Matches on nested `query_params.*` fields.
    - If `region` is provided and no document is found, falls back to searching
      without region (useful when historical docs stored region as either a code
      like "GB" or a name like "United Kingdom").
    """
    db = client[DB_NAME]
    collection = db[CLIMATIQ_COLLECTION]

    base_query = {
        "query_params.activity_id": activity_id,
        "query_params.source_lca_activity": source_lca_activity,
        "query_params.passengers": passengers,
        "query_params.distance": distance,
        "query_params.distance_unit": distance_unit,
    }

    query = dict(base_query)
    if region:
        query["query_params.region"] = region

    doc = collection.find_one(query, sort=[("_id", -1)])
    if not doc and region:
        doc = collection.find_one(base_query, sort=[("_id", -1)])
    return doc


def get_country_regions():
    """
    Retrieve the country to region mapping from MongoDB.
    Returns:
        Dict of country to region
    """
    db = client[DB_NAME]
    collection = db[COUNTRY_REGIONS_COLLECTION]
    doc = collection.find_one({"_id": "regions"})
    if doc:
        del doc["_id"]
        return doc
    return {}


def save_country_regions(regions: dict):
    """
    Save the country to region mapping to MongoDB.
    Args:
        regions: Dict of country to region
    """
    db = client[DB_NAME]
    collection = db[COUNTRY_REGIONS_COLLECTION]
    collection.replace_one(
        {"_id": "regions"}, {"_id": "regions", **regions}, upsert=True
    )


def get_country_region(country: str):
    """
    Get the region for a specific country.
    Args:
        country: Country name
    Returns:
        Region string or None
    """
    regions = get_country_regions()
    return regions.get(country.upper())


def save_airport_distance(iata: str, distance_km: float):
    """Save a single airport distance (in km) into a shared mapping document.

    The collection stores a single document with _id='distances' and a
    `distances` sub-document mapping IATA codes to km values.
    """
    db = client[DB_NAME]
    collection = db[AIRPORT_DISTANCE_COLLECTION]
    key = f"distances.{iata.upper()}"
    collection.update_one(
        {"_id": "distances"}, {"$set": {key: float(distance_km)}}, upsert=True
    )


def get_airport_distance(iata: str):
    """Retrieve the saved distance (km) for an IATA code, or None if missing."""
    db = client[DB_NAME]
    collection = db[AIRPORT_DISTANCE_COLLECTION]
    doc = collection.find_one({"_id": "distances"})
    if not doc:
        return None
    distances = doc.get("distances") or {}
    return distances.get(iata.upper())


def get_transport_activity_mapping() -> dict:
    """Retrieve the transport mode -> Climatiq activity_id mapping.

    Stored as a single document with `_id='default'` and a `mapping` sub-document.
    Returns an empty dict if not configured.
    """
    db = client[DB_NAME]
    collection = db[TRANSPORT_ACTIVITY_MAPPING_COLLECTION]
    doc = collection.find_one({"_id": "default"})
    if not doc:
        return {}
    mapping = doc.get("mapping")
    return mapping if isinstance(mapping, dict) else {}


def save_transport_activity_mapping(mapping: dict):
    """Save the transport mode -> Climatiq activity_id mapping."""
    db = client[DB_NAME]
    collection = db[TRANSPORT_ACTIVITY_MAPPING_COLLECTION]
    collection.replace_one(
        {"_id": "default"},
        {"_id": "default", "mapping": mapping},
        upsert=True,
    )
