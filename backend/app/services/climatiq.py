import os
import requests
from dotenv import load_dotenv
import json

load_dotenv()

# Allow tests to run without real API keys by setting TESTING=1 in the environment.
TESTING = os.getenv("TESTING", "0").lower() in ("1", "true", "yes")

CLIMATIQ_API_KEY = os.getenv("CLIMATIQ_API_KEY")
if not CLIMATIQ_API_KEY:
    raise ValueError("CLIMATIQ_API_KEY is not set")

# If testing, leave headers empty so requests can be patched/mocked in tests.
HEADERS = {"Authorization": f"Bearer {CLIMATIQ_API_KEY}"} if CLIMATIQ_API_KEY else {}

SEARCH_URL = "https://api.climatiq.io/data/v1/search"
ESTIMATE_URL = "https://api.climatiq.io/data/v1/estimate"

# MongoDB integration
from .mongodb import save_climatiq_response, get_latest_climatiq_response


def search_emission_factors(mode_of_transport: str, region: str, lca_activity: str = "well_to_tank"):
    """Search for emission factors and return the latest matching activity metadata."""
    params = {
        "query": mode_of_transport.replace("_", " "),
        "data_version": "27",
        #"source": "UK Government (BEIS, DEFRA, DESNZ)",
        "sector": "Transport",
        "year": 2025
    }
    try:
        resp = requests.get(SEARCH_URL, params=params, headers=HEADERS)
        print(f"[Climatiq] Search Request URL: {resp.url}")
        print(f"[Climatiq] Search Response status: {resp.status_code}")
        if not resp.ok:
            print(f"[Climatiq] Search Response text: {resp.text}")
            resp.raise_for_status()
        results = resp.json().get("results", [])
        print("🔍 RAW SEARCH RESULTS:\n", json.dumps(results, indent=2))
        if not results:
            raise ValueError(f"No search results for {mode_of_transport}")
        else:
            print("✅ Climatiq search returned a response!")
    except requests.HTTPError as e:
        print(f"[Climatiq] Search HTTPError: {e}")
        raise ValueError(f"Climatiq search error: {e}")

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

    return latest


def estimate_emission_factors(activity_id: str, region: str, lca_activity: str = "well_to_tank", passengers: int = 4, distance: int = 100):
    """Estimate emissions for a given activity_id."""
    #if activity_id == "passenger_train-route_type_underground-fuel_source_na":
    activity_region = "GB"
    estimate_payload = {
        "emission_factor": {
            "activity_id": activity_id,
            #"region": region,
            "year": 2025,  # Assuming year, or could be parameter
            "source_lca_activity": lca_activity,
            "data_version": "^29"
        },
        "parameters": {
            "passengers": passengers,
            "distance": distance,
            "distance_unit": "km"
        }
    }
    try:
        est_resp = requests.post(ESTIMATE_URL, json=estimate_payload, headers=HEADERS)
        print(f"[Climatiq] Estimate Request: {estimate_payload}")
        print(f"[Climatiq] Estimate Response status: {est_resp.status_code}")
        if not est_resp.ok:
            print(f"[Climatiq] Estimate Response text: {est_resp.text}")
            est_resp.raise_for_status()
        estimate_data = est_resp.json()
        print("🔍 RAW ESTIMATE RESULTS:\n", json.dumps(estimate_data, indent=2))
    except requests.HTTPError as e:
        print(f"[Climatiq] Estimate HTTPError: {e}")
        raise ValueError(f"Climatiq estimate error: {e}")

    return estimate_data


def get_emission_factors(
    mode_of_transport: str, region: str, lca_activity: str = "well_to_tank", passengers: int = 4, distance: int = 100
):
    """Combined search and estimate for backward compatibility."""
    latest = search_emission_factors(mode_of_transport, region, lca_activity)
    estimate_data = estimate_emission_factors(latest["activity_id"], region, lca_activity, passengers, distance, source=latest.get("source", "BEIS"))

    # Prepare output (combine metadata and estimate)
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
        # Include estimate results
        "estimate_co2e": estimate_data.get("co2e"),
        "estimate_co2e_unit": estimate_data.get("co2e_unit"),
        "estimate_constituent_gases": estimate_data.get("constituent_gases"),
        "estimate_co2e_calculation_method": estimate_data.get("co2e_calculation_method"),
    }
    # Save to MongoDB for future fallback
    params = {
        "query": mode_of_transport.replace("_", " "),
        "data_version": "27",
        "source": "BEIS",
        "sector": "Transport",
        "year": 2025,
        "region": region,
        "lca_activity": lca_activity
    }
    save_climatiq_response(params, output)
    return output


def get_specific_activities():
    # Updated: Test with a single activity_id and lca_activity for simplicity
    activity_ids = [
        "passenger_vehicle-vehicle_type_coach-fuel_source_na-distance_na-engine_size_na"  # Single test activity
    ]
    queries = {
        "passenger_vehicle-vehicle_type_coach-fuel_source_na-distance_na-engine_size_na": "coach"
    }
    region = "GB"
    results = {region: []}
    for activity_id in activity_ids:
        mode = queries.get(activity_id, activity_id.replace("_", " "))
        for lca in ["well_to_tank"]:  # Single LCA for testing
            try:
                data = get_emission_factors(mode, region, lca)
                results[region].append(data)
            except ValueError as e:
                print(f"Error for {activity_id} {lca}: {e}")
    return results
