from app.services.mongodb import client, DB_NAME
from app.services.ollama import ask_ollama
from app.services.city_fare_prompt import get_fare_summary_prompt
import logging
from typing import Dict, Any

FARE_SUMMARY_COLLECTION = "city_fare_summaries"


def get_fare_summary_for_city(city: str) -> Dict[str, Any]:
    """
    Retrieve the fare summary for a given city from MongoDB.
    Args:
        city: The city name
    Returns:
        The fare summary dictionary or None if not found
    """
    db = client[DB_NAME]
    collection = db[FARE_SUMMARY_COLLECTION]
    doc = collection.find_one({"city": city.upper()})
    return doc["summary"] if doc else None


def save_fare_summary_for_city(city: str, summary: Dict[str, Any]) -> None:
    """
    Save or update the fare summary for a given city in MongoDB.
    Args:
        city: The city name
        summary: The fare summary dictionary
    """
    db = client[DB_NAME]
    collection = db[FARE_SUMMARY_COLLECTION]
    # Upsert: update if exists, insert if not
    collection.replace_one(
        {"city": city.upper()},
        {"city": city.upper(), "summary": summary},
        upsert=True
    )


def generate_fare_summary_for_city(city: str) -> Dict[str, Any]:
    """
    Generate a fare summary for a city using the LLM.
    Args:
        city: The city name
    Returns:
        The generated summary dictionary
    """
    prompt = get_fare_summary_prompt().format(city=city)
    messages = [{"role": "user", "content": prompt}]
    try:
        response_text = ask_ollama("gpt-oss:120b", messages)
        # Parse the JSON response
        import json
        summary_dict = json.loads(response_text.strip())
        return summary_dict
    except json.JSONDecodeError as e:
        logging.exception("Failed to parse JSON from LLM response for city %s: %s", city, response_text[:500])
        raise ValueError(f"Invalid JSON response from LLM: {str(e)}")
    except Exception as e:
        logging.exception("Failed to generate fare summary for city %s", city)
        raise


def log_fare_summary_prompt(prompt: str, city: str, response: Dict[str, Any]):
    """
    Log the prompt and response for auditing purposes.
    This could be extended to save to a log collection if needed.
    """
    logging.info("Fare summary prompt for city %s: %s", city, prompt[:200] + "..." if len(prompt) > 200 else prompt)
    logging.info("Fare summary response for city %s: %s", city, str(response)[:200] + "..." if len(str(response)) > 200 else str(response))