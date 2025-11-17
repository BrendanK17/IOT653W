import os
import requests
from dotenv import load_dotenv
import json

load_dotenv()

# Allow tests to run without real API keys by setting TESTING=1 in the environment.
TESTING = os.getenv("TESTING", "0").lower() in ("1", "true", "yes")

CLIMATIQ_API_KEY = os.getenv("CLIMATIQ_API_KEY")
if not CLIMATIQ_API_KEY and not TESTING:
    raise ValueError("CLIMATIQ_API_KEY is not set")

# If testing, leave headers empty so requests can be patched/mocked in tests.
HEADERS = (
    {"Authorization": f"Bearer {CLIMATIQ_API_KEY}"} if CLIMATIQ_API_KEY else {}
)

SEARCH_URL = "https://api.climatiq.io/data/v1/search"
ESTIMATE_URL = "https://api.climatiq.io/data/v1/estimate"

# MongoDB integration
from .mongodb import save_climatiq_response, get_latest_climatiq_response


def get_emission_factors(
    mode_of_transport: str, region: str, lca_activity: str = "well_to_tank"
):

    # -----------------------------
    # 1) SEARCH
    # -----------------------------
    params = {"query": mode_of_transport.replace("_", " "), "data_version": "27"}
    try:
        resp = requests.get(SEARCH_URL, params=params, headers=HEADERS)
        print(f"[Climatiq] Request URL: {resp.url}")
        print(f"[Climatiq] Response status: {resp.status_code}")
        if not resp.ok:
            print(f"[Climatiq] Response text: {resp.text}")
            resp.raise_for_status()
        results = resp.json().get("results", [])
        print("🔍 RAW SEARCH RESULTS:\n", json.dumps(results, indent=2))
        if not results:
            raise ValueError(f"No search results for {mode_of_transport}")
        else:
            print("✅ Climatiq API returned a response!")
    except requests.HTTPError as e:
        print(f"[Climatiq] HTTPError: {e}")
        print("[Climatiq] Falling back to MongoDB cache.")
        # Add region and lca_activity to params for cache lookup
        cache_params = params.copy()
        cache_params["region"] = region
        cache_params["lca_activity"] = lca_activity
        cached = get_latest_climatiq_response(cache_params)
        if cached:
            print("[MongoDB] Returning cached response.")
            return cached
        else:
            raise ValueError(f"Climatiq API error and no cached result found: {e}")

    # Filter results for region and lca_activity
    filtered = [
        r
        for r in results
        if r.get("region") == region
        and r.get("source_lca_activity", lca_activity) == lca_activity
    ]
    if not filtered:
        filtered = [r for r in results if r.get("region") == region]
    if not filtered:
        filtered = results

    # Select latest year
    filtered.sort(key=lambda r: r.get("year", 0), reverse=True)
    latest = filtered[0] if filtered else None
    if not latest:
        raise ValueError(
            f"No matching emission factors found for {mode_of_transport} in region {region}"
        )

    # Prepare output
    output = {
        "activity_id": latest.get("activity_id"),
        "name": latest.get("name"),
        "category": latest.get("category"),
        "sector": latest.get("sector"),
        "year": latest.get("year"),
        "region": latest.get("region"),
        "region_name": latest.get("region_name"),
        "unit_type": latest.get("unit_type"),
        "unit": latest.get("unit"),
        "source_lca_activity": latest.get("source_lca_activity", lca_activity),
        "source_link": latest.get("source_link"),
        "source_dataset": latest.get("source_dataset"),
        "description": latest.get("description"),
        "supported_calculation_methods": latest.get("supported_calculation_methods"),
        "constituent_gases": latest.get("constituent_gases"),
        "data_version": latest.get("data_version"),
        "data_quality_flags": latest.get("data_quality_flags"),
        "uncertainty": latest.get("uncertainty"),
        "access_type": latest.get("access_type"),
    }
    # Save to MongoDB for future fallback
    mongo_params = params.copy()
    mongo_params["region"] = region
    mongo_params["lca_activity"] = lca_activity
    save_climatiq_response(mongo_params, output)
    return output
