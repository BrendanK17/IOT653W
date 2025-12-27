from typing import List, Dict, Any, Optional
from app.services.mongodb import (
    client,
    DB_NAME,
    get_airport_distance,
    find_latest_climatiq_doc,
    get_transport_activity_mapping,
)
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


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    from math import radians, sin, cos, atan2, sqrt

    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


def _infer_distance_km_from_stops(doc: Dict[str, Any]) -> Optional[int]:
    stops = doc.get("stops")
    if not isinstance(stops, list) or len(stops) < 2:
        return None
    first = stops[0] if isinstance(stops[0], dict) else None
    last = stops[-1] if isinstance(stops[-1], dict) else None
    if not first or not last:
        return None
    try:
        lat1 = float(first.get("lat"))
        lon1 = float(first.get("lon"))
        lat2 = float(last.get("lat"))
        lon2 = float(last.get("lon"))
    except Exception:
        return None
    return int(round(_haversine_km(lat1, lon1, lat2, lon2)))


def _map_transport_to_activity_id(doc: Dict[str, Any], mapping: Dict[str, str]) -> Optional[str]:
    """Map transport `mode` to a Climatiq activity_id using the configured MongoDB mapping.

    No heuristics: if it doesn't match, it must be manually mapped.
    """
    mode = (doc.get("mode") or "").strip().lower()
    if not mode:
        return None
    return mapping.get(mode)

def _build_co2_block_from_climatiq_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    resp = doc.get("response") if isinstance(doc, dict) else None
    if not isinstance(resp, dict):
        return {}
    ef = resp.get("emission_factor")
    ef = ef if isinstance(ef, dict) else {}

    return {
        "co2e": resp.get("co2e"),
        "co2e_unit": resp.get("co2e_unit"),
        "constituent_gases": resp.get("constituent_gases"),
        "source": ef.get("source"),
        "emission_factor_name": ef.get("name"),
        "activity_id": ef.get("activity_id"),
        "year": ef.get("year"),
    }


def enrich_transports_co2_for_airport(
    *,
    iata: str,
    passengers: int = 1,
    distance_km: Optional[int] = None,
    region: Optional[str] = None,
    force: bool = False,
) -> Dict[str, Any]:
    """Populate `co2` for each transport for an airport using stored Climatiq responses.

    Writes back into the `airport_transports` collection for documents with this IATA.
    """
    db = get_db()
    col = db[TRANSPORTS_COLLECTION]

    iata_u = iata.upper()
    docs = list(col.find({"iata": iata_u}))

    mapping = get_transport_activity_mapping()
    if not mapping:
        return {
            "iata": iata_u,
            "distance_km": distance_km,
            "passengers": passengers,
            "updated": 0,
            "skipped": 0,
            "total": len(docs),
            "missing": [
                {
                    "reason": "mapping_not_configured",
                    "how_to_fix": {
                        "seed_defaults": "POST /transport-activity-mapping/seed-defaults",
                        "manual_update": "PUT /transport-activity-mapping",
                    },
                }
            ],
        }

    if distance_km is None:
        saved = get_airport_distance(iata_u)
        if saved is not None:
            try:
                distance_km = int(round(float(saved)))
            except Exception:
                distance_km = None

    updated = 0
    skipped = 0
    missing = []

    for d in docs:
        transport_id = d.get("id")
        if not isinstance(transport_id, str) or not transport_id:
            skipped += 1
            continue

        current_co2 = d.get("co2")
        if current_co2 not in (None, {}) and not force:
            skipped += 1
            continue

        act_id = _map_transport_to_activity_id(d, mapping)
        if not act_id:
            missing.append(
                {
                    "id": transport_id,
                    "reason": "no_activity_mapping",
                    "mode": d.get("mode"),
                }
            )
            continue

        dk = distance_km
        if dk is None:
            dk = _infer_distance_km_from_stops(d)
        if dk is None:
            missing.append({"id": transport_id, "reason": "no_distance"})
            continue

        wtt_doc = find_latest_climatiq_doc(
            activity_id=act_id,
            source_lca_activity="well_to_tank",
            passengers=passengers,
            distance=dk,
            distance_unit="km",
            region=region,
        )
        fc_doc = find_latest_climatiq_doc(
            activity_id=act_id,
            source_lca_activity="fuel_combustion",
            passengers=passengers,
            distance=dk,
            distance_unit="km",
            region=region,
        )

        if not wtt_doc and not fc_doc:
            missing.append({"id": transport_id, "reason": "no_climatiq_match", "activity_id": act_id, "distance": dk})
            continue

        wtt_block = _build_co2_block_from_climatiq_doc(wtt_doc) if wtt_doc else None
        fc_block = _build_co2_block_from_climatiq_doc(fc_doc) if fc_doc else None

        # Prefer source from either block (BEIS in your example)
        src = None
        for blk in (wtt_block, fc_block):
            if isinstance(blk, dict) and blk.get("source"):
                src = blk.get("source")
                break

        co2_obj = {
            "activity_id": act_id,
            "passengers": passengers,
            "distance_km": dk,
            "source": src,
            "well_to_tank": wtt_block,
            "fuel_combustion": fc_block,
        }

        res = col.update_one(
            {"iata": iata_u, "id": transport_id},
            {"$set": {"co2": co2_obj, "updated_at": datetime.utcnow()}},
        )
        if res.modified_count:
            updated += 1

    return {
        "iata": iata_u,
        "distance_km": distance_km,
        "passengers": passengers,
        "updated": updated,
        "skipped": skipped,
        "total": len(docs),
        "missing": missing,
    }


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
