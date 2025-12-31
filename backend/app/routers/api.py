from app.services.climatiq import (
    estimate_emission_factors,
    save_climatiq_response,
    search_emission_factors,
)
from fastapi import APIRouter, HTTPException, Query, Body
from fastapi.responses import PlainTextResponse
from app.services.ollama import ask_ollama
import logging
import os
from app.utils import sanitize_string, validate_iata, validate_city
from fastapi import HTTPException
from app.services.airports import (
    get_all_airports,
    get_airport_by_iata,
    replace_airports_for_country,
    replace_all_airports,
    log_prompt,
)
from app.services.airport_prompt import get_prompt
from app.services.city_center_prompt import get_prompt as get_city_center_prompt
from app.services.terminal_transfers_prompt import get_prompt as get_terminal_transfers_prompt
from app.services.airport_transports import (
    get_transports_for_airport,
    replace_transports_for_airport,
    log_prompt as transport_log_prompt,
    enrich_transports_co2_for_airport,
)
from app.services.airport_agent import run_airport_lookup
import json
from app.services.tavily import (
    search as tavily_search,
    extract_snippets,
    TAVILY_ENABLED,
)

try:
    from app.services.tavily import _HAS_TAVILY_SDK  # type: ignore
except Exception:
    _HAS_TAVILY_SDK = False
from app.services.city_fares import (
    get_fare_summary_for_city,
    save_fare_summary_for_city,
    generate_fare_summary_for_city,
    log_fare_summary_prompt,
)
from app.services.mongodb import (
    get_activity_ids,
    save_activity_ids,
    get_country_regions,
    save_country_regions,
    get_country_region,
    get_all_climatiq_responses,
    get_transport_activity_mapping,
    save_transport_activity_mapping,
    save_terminal_transfers,
    get_terminal_transfers,
    get_all_terminal_transfers,
)
from app.services.mongodb import save_airport_distance, get_airport_distance
from math import radians, sin, cos, atan2, sqrt
from app.services.mongodb import save_climatiq_response

router = APIRouter(tags=["Example"])


@router.get("/example")
def get_example():
    """Returns a static example message."""
    return {"message": "This is an example endpoint."}


@router.get("/llm")
def query_ollama(
    prompt: str = Query("Why is the sky blue?", description="Prompt for the LLM")
):
    """Query the Ollama LLM with a user prompt."""
    messages = [{"role": "user", "content": prompt}]
    try:
        response = ask_ollama("gpt-oss:120b-cloud", messages)
        return {"response": response}
    except Exception as e:
        logging.exception("Error querying Ollama")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/climatiq")
def query_climatiq(
    region: str = Query("GB", description="Region code"),
    passengers: int = Query(4, description="Number of passengers"),
    distance: int = Query(100, description="Distance in km"),
):
    """Query Climatiq for emission factors using saved activity IDs for the region."""
    try:
        activity_entries = get_activity_ids(region)
        if not activity_entries:
            raise ValueError(f"No activity IDs found for region {region}")

        results = []
        for entry in activity_entries:
            # New schema: list[str]. Kept backward-compatible with older stored shapes.
            if isinstance(entry, dict):
                activity_id = entry.get("activity_id")
            else:
                activity_id = entry

            if not activity_id or not isinstance(activity_id, str):
                logging.warning("Skipping invalid activity entry: %r", entry)
                continue

            activity_region = region

            # Special-case: underground activity should use GB region
            if activity_id == "passenger_train-route_type_underground-fuel_source_na":
                activity_region = "GB"

            activities_to_query = ["well_to_tank", "fuel_combustion"]
            activities_to_query = list(dict.fromkeys(activities_to_query))
            for activity in activities_to_query:
                try:
                    result = estimate_emission_factors(
                        activity_id, activity_region, activity, passengers, distance
                    )
                    results.append(
                        {
                            "activity_id": activity_id,
                            "region": activity_region,
                            "source_lca_activity": activity,
                            "result": result,
                        }
                    )

                    params = {
                        "activity_id": activity_id,
                        "region": activity_region,
                        "source_lca_activity": activity,
                        "passengers": passengers,
                        "distance": distance,
                        "distance_unit": "km",
                    }
                    try:
                        est_params = {
                            "activity_id": activity_id,
                            "region": activity_region,
                            "source": "UK Government (BEIS, DEFRA, DESNZ)",
                            "source_lca_activity": activity,
                            "passengers": passengers,
                            "distance": distance,
                            "distance_unit": "km",
                        }
                        save_climatiq_response(est_params, result)
                    except Exception:
                        save_climatiq_response(params, result)
                except Exception as e:
                    logging.warning(
                        f"Failed to estimate for activity_id {activity_id} activity {activity} region {activity_region}: {e}"
                    )
                    continue

        return {"results": results}
    except Exception:
        logging.exception("Unexpected error in query_climatiq")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/climatiq/ids")
def api_get_climatiq_activity_ids(
    location: str = Query("GB", description="Location key (e.g., GB)")
):
    """Return saved Climatiq activity IDs for a location.

    Response is a plain JSON array of activity_id strings.
    """
    try:
        return get_activity_ids(location)
    except Exception:
        logging.exception("Failed to get climatiq activity ids")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/climatiq/ids")
def api_put_climatiq_activity_ids(
    activity_ids: list[str] = Body(...),
    location: str = Query("GB", description="Location key (e.g., GB)"),
):
    """Replace saved Climatiq activity IDs for a location.

    Body must be a JSON array of activity_id strings.
    """
    try:
        cleaned: list[str] = []
        for it in activity_ids or []:
            if not isinstance(it, str) or not it.strip():
                raise HTTPException(
                    status_code=400, detail="All activity_ids must be non-empty strings"
                )
            cleaned.append(it.strip())

        # Deduplicate while preserving order
        cleaned = list(dict.fromkeys(cleaned))

        save_activity_ids(location, cleaned)
        return {"message": "Climatiq activity ids updated", "count": len(cleaned)}
    except HTTPException:
        raise
    except Exception:
        logging.exception("Failed to update climatiq activity ids")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/climatiq/search")
def climatiq_search(
    mode_of_transport: str = Query("national rail", description="Mode of transport"),
    region: str = Query("GB", description="Region code"),
    source_lca_activity: str = Query("well_to_tank", description="Source LCA activity"),
):
    """Search for Climatiq activity metadata."""
    try:
        result = search_emission_factors(mode_of_transport, region, source_lca_activity)
        return {"result": result}
    except Exception:
        logging.exception("Unexpected error in climatiq_search")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/climatiq/estimate")
def climatiq_estimate(
    activity_id: str = Query(..., description="Activity ID from search"),
    region: str = Query("GB", description="Region code"),
    source_lca_activity: str = Query("well_to_tank", description="Source LCA activity"),
    passengers: int = Query(4, description="Number of passengers"),
    distance: int = Query(100, description="Distance in km"),
):
    """Estimate emissions for a given activity ID."""
    try:
        result = estimate_emission_factors(
            activity_id, region, source_lca_activity, passengers, distance
        )
        return {"result": result}
    except Exception:
        logging.exception("Unexpected error in climatiq_estimate")
        raise HTTPException(status_code=500, detail="Internal server error")
        # Special-case: underground activity should use GB regardless of stored region


@router.get("/climatiq/responses")
def climatiq_responses():
    """Return all stored Climatiq responses from MongoDB."""
    try:
        docs = get_all_climatiq_responses()
        return {"responses": docs, "count": len(docs)}
    except Exception:
        logging.exception("Failed to fetch climatiq responses")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/transport-activity-mapping")
def api_get_transport_activity_mapping():
    """Return the configured mapping of transport `mode` -> Climatiq `activity_id`.

    Response is the mapping object itself (a JSON dictionary).
    """
    try:
        mapping = get_transport_activity_mapping()
        return mapping
    except Exception:
        logging.exception("Failed to get transport activity mapping")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/transport-activity-mapping")
def api_put_transport_activity_mapping(payload: dict = Body(...)):
    """Update the mapping of transport `mode` -> Climatiq `activity_id`.

    `mapping` must be an object whose keys are one of:
    underground, tube, metro, train, rail, bus, coach.
    """
    try:
        if not isinstance(payload, dict):
            raise HTTPException(status_code=400, detail="mapping must be an object")

        # Allow either raw mapping object, or {"mapping": {...}}
        mapping = payload
        if "mapping" in payload and isinstance(payload.get("mapping"), dict):
            mapping = payload["mapping"]

        allowed_modes = {
            "underground",
            "tube",
            "metro",
            "train",
            "rail",
            "bus",
            "coach",
        }

        cleaned: dict[str, str] = {}
        for k, v in mapping.items():
            if not isinstance(k, str):
                raise HTTPException(
                    status_code=400, detail="mapping keys must be strings"
                )
            key = k.strip().lower()
            if key not in allowed_modes:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid mode '{k}'. Allowed: {sorted(allowed_modes)}",
                )
            if not isinstance(v, str) or not v.strip():
                raise HTTPException(
                    status_code=400,
                    detail=f"activity_id for '{k}' must be a non-empty string",
                )
            cleaned[key] = v.strip()

        save_transport_activity_mapping(cleaned)
        return {"message": "Transport activity mapping updated", "count": len(cleaned)}
    except HTTPException:
        raise
    except Exception:
        logging.exception("Failed to update transport activity mapping")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/airports")
def api_get_airports():
    """Return all airports stored in MongoDB."""
    try:
        docs = get_all_airports()
        return {"airports": docs}
    except Exception:
        logging.exception("Failed to get airports from DB")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/airports/{iata}/country")
def api_get_airport_country(iata: str):
    """Return the country for a given IATA airport code."""
    try:
        iata = validate_iata(iata)
        airport = get_airport_by_iata(iata.upper())
        if not airport:
            raise HTTPException(status_code=404, detail="Airport not found")
        return PlainTextResponse(content=airport.get("country"))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception:
        logging.exception("Failed to get airport country from DB")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/airports/{iata}/coords")
def api_get_airport_coords(iata: str):
    """Return latitude and longitude for a given IATA airport code."""
    try:
        iata = validate_iata(iata)
        airport = get_airport_by_iata(iata.upper())
        if not airport:
            raise HTTPException(status_code=404, detail="Airport not found")
        lat = airport.get("lat")
        lon = airport.get("lon")
        return {"lat": lat, "lon": lon}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception:
        logging.exception("Failed to get airport coords from DB")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/airports/update")
def api_update_airports(country: str = "ALL"):
    """Update airports for a given country (ISO code) or ALL using the stored Ollama prompt.

    This endpoint calls Ollama with a fixed prompt to generate JSON and saves the result to MongoDB.
    """
    prompt = get_prompt()
    messages = [{"role": "user", "content": prompt + f"\nCountry: {country}"}]
    try:
        response_text = ask_ollama("gpt-oss:120b", messages)
    except Exception as e:
        logging.exception("Ollama query failed")
        raise HTTPException(status_code=500, detail="LLM request failed")

    # log prompt and response for auditing
    try:
        log_prompt(prompt, country, response_text)
    except Exception:
        logging.exception("Failed to log prompt/response")

    # parse JSON from response
    try:
        data = json.loads(response_text)
        if not isinstance(data, list):
            raise ValueError("Expected JSON array from LLM")
        # minimal validation: ensure required keys exist
        cleaned = []
        for item in data:
            if not isinstance(item, dict):
                continue
            # Safely parse latitude and longitude: store values first so mypy
            # can narrow types, and convert inside try/except to handle
            # non-numeric or unexpected types gracefully.
            lat_val = item.get("lat")
            lon_val = item.get("lon")

            city_lat_val = item.get("city_lat")
            city_lon_val = item.get("city_lon")

            lat = None
            lon = None

            if lat_val is not None:
                try:
                    lat = float(lat_val)
                except (TypeError, ValueError):
                    lat = None

            if lon_val is not None:
                try:
                    lon = float(lon_val)
                except (TypeError, ValueError):
                    lon = None

            city_lat = None
            city_lon = None
            if city_lat_val is not None:
                try:
                    city_lat = float(city_lat_val)
                except (TypeError, ValueError):
                    city_lat = None

            if city_lon_val is not None:
                try:
                    city_lon = float(city_lon_val)
                except (TypeError, ValueError):
                    city_lon = None

            cleaned.append(
                {
                    "iata": item.get("iata"),
                    "name": item.get("name"),
                    "city": item.get("city"),
                    "country": item.get("country"),
                    "lat": lat,
                    "lon": lon,
                    "city_lat": city_lat,
                    "city_lon": city_lon,
                    "aliases": item.get("aliases") or [],
                }
            )
        # Strict validation: ensure each item has exactly the required keys
        required_keys = {
            "iata",
            "name",
            "city",
            "country",
            "lat",
            "lon",
            "city_lat",
            "city_lon",
            "aliases",
        }
        invalid_items = []
        for idx, c in enumerate(cleaned):
            if not isinstance(c, dict):
                invalid_items.append((idx, "not an object"))
                continue
            keys = set(c.keys())
            if keys != required_keys:
                # allow missing keys or extra keys to be reported
                missing = required_keys - keys
                extra = keys - required_keys
                invalid_items.append(
                    (idx, {"missing": list(missing), "extra": list(extra)})
                )

        if invalid_items:
            logging.error(
                "LLM response failed validation; not saving. Details: %s", invalid_items
            )
            logging.error("LLM response text: %s", response_text)
            raise HTTPException(
                status_code=500,
                detail=f"LLM response failed validation for {len(invalid_items)} items; check logs for details",
            )

        # save for country or ALL
        # First, delete all existing airports to avoid duplicates from previous updates
        from app.services.mongodb import client, DB_NAME
        db = client[DB_NAME]
        col = db["airports"]
        col.delete_many({})
        if country.upper() == "ALL":
            replace_all_airports(cleaned)
        else:
            replace_airports_for_country(country.upper(), cleaned)
        return {"message": "Airports updated", "count": len(cleaned)}
    except json.JSONDecodeError:
        logging.exception("Failed to parse JSON from LLM response")
        raise HTTPException(
            status_code=500, detail="Failed to parse JSON from LLM response"
        )
    except Exception:
        logging.exception("Unexpected error updating airports")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/airports/{iata}/distance")
def api_compute_and_save_distance(iata: str):
    """Compute distance (km) between airport and city centre, save to MongoDB mapping, return rounded km as plain text."""
    try:
        iata = validate_iata(iata)
        airport = get_airport_by_iata(iata.upper())
        if not airport:
            raise HTTPException(status_code=404, detail="Airport not found")

        a_lat = airport.get("lat")
        a_lon = airport.get("lon")
        city = airport.get("city")
        country = airport.get("country")

        if a_lat is None or a_lon is None:
            raise HTTPException(
                status_code=400, detail="Airport coordinates not available"
            )
        if not city:
            raise HTTPException(status_code=400, detail="Airport city not available")

        prompt = get_city_center_prompt()
        messages = [
            {
                "role": "user",
                "content": prompt + f"\nCity: {city}\nCountry: {country or ''}",
            }
        ]
        try:
            resp_text = ask_ollama("gpt-oss:120b", messages)
        except Exception:
            logging.exception("Ollama request failed for city centre lookup")
            raise HTTPException(status_code=500, detail="LLM request failed")

        try:
            obj = json.loads(resp_text)
            if not isinstance(obj, dict):
                raise ValueError("Expected JSON object from LLM")
            c_lat = obj.get("lat")
            c_lon = obj.get("lon")
            if c_lat is None or c_lon is None:
                raise ValueError("City centre coordinates missing or null")
            c_lat = float(c_lat)
            c_lon = float(c_lon)
        except Exception:
            logging.exception(
                "Failed to parse city centre coords from LLM response: %s", resp_text
            )
            raise HTTPException(
                status_code=500,
                detail="Failed to parse city coordinates from LLM response",
            )

        # compute haversine in km
        R = 6371.0
        lat1 = radians(float(a_lat))
        lon1 = radians(float(a_lon))
        lat2 = radians(c_lat)
        lon2 = radians(c_lon)
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        km = R * c

        # save to DB (km as float)
        try:
            save_airport_distance(iata.upper(), float(km))
        except Exception:
            logging.exception("Failed to save airport distance for %s", iata)
            raise HTTPException(status_code=500, detail="Failed to save distance")

        return PlainTextResponse(content=str(int(round(km))))
    except HTTPException:
        raise
    except Exception:
        logging.exception("Unexpected error computing/saving distance for %s", iata)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/airports/{iata}/distance")
def api_get_saved_distance(iata: str):
    """Retrieve saved distance (km) for an IATA code and return as rounded integer plain text."""
    try:
        iata = validate_iata(iata)
        val = get_airport_distance(iata.upper())
        if val is None:
            # attempt to compute and save the distance, then return result
            return api_compute_and_save_distance(iata)

        return PlainTextResponse(content=str(int(round(float(val)))))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception:
        logging.exception("Failed to retrieve saved distance for %s", iata)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/airports/{iata}/transports")
def api_get_transports(
    iata: str, passengers: int = Query(1, description="Number of passengers")
):
    """Return transport options for a specific airport.

    If transports are not present in the database, call the LLM prompt on-demand,
    store the results, and return them.
    """
    try:
        iata = validate_iata(iata)
        if passengers < 1 or passengers > 10:
            raise HTTPException(status_code=400, detail="Passengers must be between 1 and 10")
        docs = get_transports_for_airport(iata)
        if docs:
            return {"transports": docs}

        # Not in DB: run the new airport agent which will orchestrate the LLM + tools
        try:
            cleaned = run_airport_lookup(iata)
        except Exception:
            logging.exception("Airport agent failed for %s", iata)
            raise HTTPException(status_code=500, detail="Agent request failed")

        # Log and persist
        try:
            replace_transports_for_airport(iata.upper(), cleaned)
        except Exception:
            logging.exception("Failed to save transports for %s", iata)
            raise HTTPException(status_code=500, detail="Failed to save transports")

        return {"transports": cleaned}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logging.exception("Failed to get transports from DB")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/airports/{iata}/transports/update")
def api_update_transports(iata: str):
    """Force update transports for a specific airport by calling the LLM and saving results."""
    try:
        iata = validate_iata(iata)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    logging.info("=== UPDATE TRANSPORTS ENDPOINT CALLED ===")
    logging.info("Airport IATA: %s", iata)

    try:
        logging.info("Calling run_airport_lookup for %s...", iata)
        cleaned = run_airport_lookup(iata)
        logging.info(
            "run_airport_lookup completed. Returned %d transport options", len(cleaned)
        )
        for idx, transport in enumerate(cleaned):
            logging.info(
                "Transport %d: %s (%s) with %d stops",
                idx + 1,
                transport.get("name"),
                transport.get("mode"),
                len(transport.get("stops", [])),
            )
    except Exception:
        logging.exception("Airport agent failed for update %s", iata)
        raise HTTPException(status_code=500, detail="Agent request failed")

    try:
        logging.info("Saving %d transports to MongoDB...", len(cleaned))
        replace_transports_for_airport(iata.upper(), cleaned)
        logging.info("Successfully saved transports for %s", iata)
        return {"message": "Transports updated", "count": len(cleaned)}
    except Exception:
        logging.exception("Unexpected error updating transports for %s", iata)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/airports/{iata}/transports/enrich-co2")
def api_enrich_transports_co2(
    iata: str,
    passengers: int = Query(1, description="Number of passengers"),
    distance_km: int | None = Query(
        None,
        description="Override distance in km (defaults to saved airport-city distance, else inferred from stops)",
    ),
    region: str | None = Query(
        None,
        description="Optional region string to match stored Climatiq query_params.region (falls back to any region if not found)",
    ),
    force: bool = Query(
        False, description="Overwrite existing co2 field if already populated"
    ),
):
    """Populate `co2` for stored transport options using previously saved Climatiq responses."""
    try:
        iata = validate_iata(iata)
        if passengers < 1 or passengers > 10:
            raise HTTPException(status_code=400, detail="Passengers must be between 1 and 10")
        return enrich_transports_co2_for_airport(
            iata=iata,
            passengers=passengers,
            distance_km=distance_km,
            region=region,
            force=force,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logging.exception("Failed to enrich transports co2 for %s", iata)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/cities/{city}/fares")
def api_get_city_fares(city: str):
    """Return the fare summary for a specific city.

    If the fare summary is not present in the database, generate it on-demand,
    store the results, and return them.
    """
    try:
        city = validate_city(city)
        summary = get_fare_summary_for_city(city)
        if summary:
            return {"city": city, "fare_summary": summary}

        # Not in DB: generate using LLM
        try:
            summary = generate_fare_summary_for_city(city)
        except Exception:
            logging.exception("Fare summary generation failed for %s", city)
            raise HTTPException(
                status_code=500, detail="Fare summary generation failed"
            )

        # Log and persist
        try:
            save_fare_summary_for_city(city, summary)
        except Exception:
            logging.exception("Failed to save fare summary for %s", city)
            raise HTTPException(status_code=500, detail="Failed to save fare summary")

        return {"city": city, "fare_summary": summary}
    except Exception:
        logging.exception("Failed to get fare summary for city %s", city)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/cities/{city}/fares/update")
def api_update_city_fares(city: str):
    """Force update the fare summary for a specific city by calling the LLM and saving results."""
    try:
        city = validate_city(city)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    logging.info("=== UPDATE CITY FARES ENDPOINT CALLED ===")
    logging.info("City: %s", city)

    try:
        logging.info("Generating fare summary for %s...", city)
        summary = generate_fare_summary_for_city(city)
        logging.info("Fare summary generation completed for %s", city)
    except Exception:
        logging.exception("Fare summary generation failed for update %s", city)
        raise HTTPException(status_code=500, detail="Fare summary generation failed")

    try:
        logging.info("Saving fare summary for %s...", city)
        save_fare_summary_for_city(city, summary)
        logging.info("Successfully saved fare summary for %s", city)
        return {"message": "Fare summary updated", "city": city}
    except Exception:
        logging.exception("Unexpected error updating fare summary for %s", city)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/tavily/status")
def tavily_status():
    """Return basic Tavily SDK configuration status."""
    try:
        return {
            "tavily_enabled": bool(TAVILY_ENABLED),
            "sdk_present": bool(_HAS_TAVILY_SDK),
            "api_key_present": bool(os.getenv("TAVILY_API_KEY")),
        }
    except Exception:
        logging.exception("Failed to read Tavily status")
        raise HTTPException(status_code=500, detail="Failed to read Tavily status")


@router.get("/tavily/test")
def tavily_test(
    query: str = Query(
        "Heathrow Express LHR Paddington", description="Query to test Tavily"
    ),
    limit: int = 3,
):
    """Simple health/check endpoint to test Tavily SDK calls directly."""
    try:
        logging.info("Tavily test endpoint called. Query: %s Limit: %d", query, limit)
        resp = tavily_search(query, limit=limit)
        snippets = extract_snippets(resp)
        return {
            "ok": True,
            "resp_preview": (resp if isinstance(resp, dict) else str(resp)),
            "snippets_count": len(snippets),
        }
    except Exception as e:
        logging.exception("Tavily test failed")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/country-regions")
def get_all_country_regions():
    """Get all country to region mappings."""
    return get_country_regions()


@router.get("/country-regions/{country}")
def get_region_for_country(country: str):
    """Get the region for a specific country."""
    region = get_country_region(country)
    if region is None:
        raise HTTPException(status_code=404, detail="Country not found")
    return PlainTextResponse(region)


@router.put("/country-regions")
def update_country_regions(regions: dict = Body(...)):
    """Update the country to region mappings."""
    save_country_regions(regions)
    return {"message": "Country regions updated successfully"}


@router.get("/airports/{iata}/terminal-transfers")
def api_get_terminal_transfers(iata: str):
    """Return terminal transfer information for a specific airport.

    If terminal transfers are not present in the database, return 404.
    """
    try:
        iata = validate_iata(iata)
        transfers = get_terminal_transfers(iata)
        if not transfers:
            raise HTTPException(status_code=404, detail="Terminal transfers not found for this airport")
        return transfers
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception:
        logging.exception("Failed to get terminal transfers for %s", iata)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/airports/{iata}/terminal-transfers/update")
def api_update_terminal_transfers(iata: str):
    """Generate and save terminal transfer information for a specific airport.

    This endpoint calls Ollama with a fixed prompt to generate JSON and saves the result to MongoDB.
    """
    try:
        iata = validate_iata(iata)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    logging.info("=== UPDATE TERMINAL TRANSFERS ENDPOINT CALLED ===")
    logging.info("Airport IATA: %s", iata)

    # Get the airport to ensure it exists
    airport = get_airport_by_iata(iata.upper())
    if not airport:
        raise HTTPException(status_code=404, detail="Airport not found")

    prompt = get_terminal_transfers_prompt()
    messages = [{"role": "user", "content": prompt + f"\nIATA: {iata.upper()}"}]

    try:
        logging.info("Calling Ollama to generate terminal transfers for %s...", iata)
        response_text = ask_ollama("gpt-oss:120b", messages)
        logging.info("Ollama response received for terminal transfers")
    except Exception as e:
        logging.exception("Ollama query failed for terminal transfers")
        raise HTTPException(status_code=500, detail="LLM request failed")

    # Parse JSON from response
    try:
        data = json.loads(response_text)
        if not isinstance(data, dict):
            raise ValueError("Expected JSON object as top level")

        # Extract sections for this airport
        iata_upper = iata.upper()
        if iata_upper not in data:
            raise ValueError(f"No data returned for airport {iata_upper}")

        airport_data = data[iata_upper]
        if not isinstance(airport_data, dict):
            raise ValueError("Airport data must be an object")

        sections = airport_data.get("sections", [])
        if not isinstance(sections, list):
            raise ValueError("Sections must be an array")

        # Validate sections structure
        for section in sections:
            if not isinstance(section, dict):
                raise ValueError("Each section must be an object")
            if "name" not in section or "tips" not in section:
                raise ValueError("Each section must have 'name' and 'tips' fields")
            if not isinstance(section["tips"], list):
                raise ValueError("Tips must be an array of strings")

        logging.info("Saving %d sections for airport %s", len(sections), iata)
        save_terminal_transfers(iata.upper(), sections)
        logging.info("Successfully saved terminal transfers for %s", iata)

        return {"message": "Terminal transfers updated", "iata": iata.upper(), "count": len(sections)}

    except json.JSONDecodeError:
        logging.exception("Failed to parse JSON from LLM response")
        raise HTTPException(
            status_code=500, detail="Failed to parse JSON from LLM response"
        )
    except ValueError as e:
        logging.exception("Validation error: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Invalid data format: {str(e)}")
    except Exception:
        logging.exception("Unexpected error updating terminal transfers for %s", iata)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/terminal-transfers")
def api_get_all_terminal_transfers():
    """Return all terminal transfer information from MongoDB, sorted by IATA code."""
    try:
        transfers = get_all_terminal_transfers()
        return {"transfers": transfers, "count": len(transfers)}
    except Exception:
        logging.exception("Failed to get all terminal transfers")
        raise HTTPException(status_code=500, detail="Internal server error")

