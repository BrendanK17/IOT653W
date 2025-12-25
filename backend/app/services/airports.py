from typing import List, Dict, Any, Optional
from app.services.mongodb import client, DB_NAME
from datetime import datetime
import logging

AIRPORTS_COLLECTION = "airports"
AIRPORT_PROMPT_LOG_COLLECTION = "airports_prompts"


def get_db():
    return client[DB_NAME]


def get_all_airports() -> List[Dict[str, Any]]:
    db = get_db()
    col = db[AIRPORTS_COLLECTION]
    docs = list(col.find({}, {"_id": 0}))
    return docs


def get_airport_by_iata(iata: str) -> Optional[Dict[str, Any]]:
    db = get_db()
    col = db[AIRPORTS_COLLECTION]
    doc = col.find_one({"iata": iata.upper()}, {"_id": 0})
    return doc


def upsert_airport(doc: Dict[str, Any]):
    db = get_db()
    col = db[AIRPORTS_COLLECTION]
    # use iata + country as unique key when available
    query = {}
    if doc.get("iata"):
        query["iata"] = doc["iata"]
    if doc.get("country"):
        query["country"] = doc["country"]
    if not query:
        # fallback: insert as new
        col.insert_one(doc)
        return
    # set timestamps
    doc.setdefault("created_at", datetime.utcnow())
    doc["updated_at"] = datetime.utcnow()
    col.update_one(query, {"$set": doc}, upsert=True)


def replace_airports_for_country(country: str, docs: List[Dict[str, Any]]):
    db = get_db()
    col = db[AIRPORTS_COLLECTION]
    # remove existing for country
    col.delete_many({"country": country})
    # insert new documents (remove any _id keys)
    for d in docs:
        d.pop("_id", None)
        d["country"] = country
        d.setdefault("created_at", datetime.utcnow())
        d["updated_at"] = datetime.utcnow()
    if docs:
        col.insert_many(docs)


def replace_all_airports(docs: List[Dict[str, Any]]):
    db = get_db()
    col = db[AIRPORTS_COLLECTION]
    # delete all existing
    col.delete_many({})
    for d in docs:
        d.pop("_id", None)
        d.setdefault("created_at", datetime.utcnow())
        d["updated_at"] = datetime.utcnow()
    if docs:
        col.insert_many(docs)


def log_prompt(prompt: str, country: Optional[str], response_text: str):
    try:
        db = get_db()
        col = db[AIRPORT_PROMPT_LOG_COLLECTION]
        col.insert_one(
            {
                "prompt": prompt,
                "country": country,
                "response": response_text,
                "created_at": datetime.utcnow(),
            }
        )
    except Exception:
        logging.exception("Failed to log airports prompt")
