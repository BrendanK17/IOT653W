from app.services.climatiq import get_emission_factors
from fastapi import APIRouter, HTTPException, Query
from app.services.ollama import ask_ollama
import logging
from fastapi import HTTPException
from app.services.airports import (
    get_all_airports,
    replace_airports_for_country,
    replace_all_airports,
    log_prompt,
)
from app.services.airport_prompt import get_prompt
from app.services.airport_transports import (
    get_transports_for_airport,
    replace_transports_for_airport,
    log_prompt as transport_log_prompt,
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
        response = ask_ollama("gpt-oss:120b", messages)
        return {"response": response}
    except Exception as e:
        logging.exception("Error querying Ollama")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/climatiq")
def query_climatiq(
    mode_of_transport: str = Query("national rail", description="Mode of transport"),
    region: str = Query("GB", description="Region code"),
    source_lca_activity: str = Query(
        "fuel_combustion", description="Source LCA activity"
    ),
):
    """Query Climatiq for emission factors."""
    try:
        result = get_emission_factors(mode_of_transport, region, source_lca_activity)
        return {"result": result}
    except Exception:
        logging.exception("Unexpected error in query_climatiq")
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

            cleaned.append(
                {
                    "iata": item.get("iata"),
                    "name": item.get("name"),
                    "city": item.get("city"),
                    "country": item.get("country"),
                    "lat": lat,
                    "lon": lon,
                    "aliases": item.get("aliases") or [],
                }
            )
        # save for country or ALL
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


@router.get("/airports/{iata}/transports")
def api_get_transports(iata: str):
    """Return transport options for a specific airport.

    If transports are not present in the database, call the LLM prompt on-demand,
    store the results, and return them.
    """
    try:
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
    except Exception:
        logging.exception("Failed to get transports from DB")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/airports/{iata}/transports/update")
def api_update_transports(iata: str):
    """Force update transports for a specific airport by calling the LLM and saving results."""
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


@router.get("/cities/{city}/fares")
def api_get_city_fares(city: str):
    """Return the fare summary for a specific city.

    If the fare summary is not present in the database, generate it on-demand,
    store the results, and return them.
    """
    try:
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
