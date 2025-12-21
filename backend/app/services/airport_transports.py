from typing import List, Dict, Any, Optional
from app.services.mongodb import client, DB_NAME
from datetime import datetime
import logging

TRANSPORTS_COLLECTION = "airport_transports"
TRANSPORT_PROMPT_LOG_COLLECTION = "airport_transports_prompts"


def get_db():
    return client[DB_NAME]


def get_transports_for_airport(iata: str) -> List[Dict[str, Any]]:
    db = get_db()
    col = db[TRANSPORTS_COLLECTION]
    docs = list(col.find({"iata": iata.upper()}, {"_id": 0}))
    return docs


def replace_transports_for_airport(iata: str, docs: List[Dict[str, Any]]):
    db = get_db()
    col = db[TRANSPORTS_COLLECTION]
    # delete existing for this iata
    col.delete_many({"iata": iata.upper()})
    for d in docs:
        d.pop("_id", None)
        d["iata"] = iata.upper()
        d.setdefault("created_at", datetime.utcnow())
        d["updated_at"] = datetime.utcnow()
    if docs:
        col.insert_many(docs)


def log_prompt(prompt: str, iata: Optional[str], response_text: str):
    try:
        db = get_db()
        col = db[TRANSPORT_PROMPT_LOG_COLLECTION]
        col.insert_one(
            {
                "prompt": prompt,
                "iata": iata,
                "response": response_text,
                "created_at": datetime.utcnow(),
            }
        )
    except Exception:
        logging.exception("Failed to log transport prompt")
