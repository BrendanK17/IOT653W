from app.services.climatiq import get_emission_factors
from fastapi import APIRouter, HTTPException, Query
from app.services.ollama import ask_ollama
import logging

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
