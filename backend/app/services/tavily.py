import os
import logging
from typing import Any, Dict, List, Optional
import json
import requests

from dotenv import load_dotenv
import concurrent.futures
import time

load_dotenv()
try:
    from tavily import TavilyClient  # type: ignore

    _HAS_TAVILY_SDK = True
    logging.info("Tavily SDK imported successfully")
except ImportError as e:
    TavilyClient = None  # type: ignore
    _HAS_TAVILY_SDK = False
    logging.warning("Tavily SDK not available (ImportError): %s", e)
except Exception as e:
    TavilyClient = None  # type: ignore
    _HAS_TAVILY_SDK = False
    logging.warning("Tavily SDK import failed: %s", e)

# Read the URL only if explicitly provided. Using a hard-coded default
# caused accidental requests to a non-existent endpoint (404). Require
# the developer to set `TAVILY_API_URL` in the environment or .env.
TAVILY_API_KEY: Optional[str] = os.getenv("TAVILY_API_KEY")

logging.info(
    "Tavily configuration: SDK=%s, API_KEY=%s",
    _HAS_TAVILY_SDK,
    "present" if TAVILY_API_KEY else "missing",
)

# Enabled when we have an API key and the SDK is available
TAVILY_ENABLED = bool(TAVILY_API_KEY and _HAS_TAVILY_SDK)


def search(query: str, limit: int = 5) -> Dict[str, Any]:
    """Perform a search request against the Tavily Search API.

    Returns a dictionary. On success the API response JSON is returned.
    On error a dictionary with an `error` key is returned instead of
    raising an exception, so the calling agent can handle tool failures
    without crashing.
    """
    logging.info("=== TAVILY SEARCH CALLED ===")
    logging.info("Query: %s", query)
    logging.info("Limit: %d", limit)
    logging.info("SDK Available: %s", _HAS_TAVILY_SDK)
    logging.info("API Key Present: %s", bool(TAVILY_API_KEY))
    logging.info("Tavily Enabled: %s", TAVILY_ENABLED)

    # Basic validation: avoid making requests with empty or obviously-invalid queries
    if not isinstance(query, str) or not query.strip() or len(query.strip()) < 5:
        logging.warning(
            "Tavily search called with empty/invalid query; skipping request"
        )
        return {"error": "invalid_query", "message": "query empty or too short"}

    if not TAVILY_ENABLED:
        logging.warning("Tavily is NOT enabled. Returning fallback.")
        return {"fallback": True, "results": [], "message": "Tavily not configured"}

    try:
        logging.info("Sending Tavily SDK request (SDK=%s)...", _HAS_TAVILY_SDK)
        logging.debug(
            "Tavily request payload: %s", json.dumps({"query": query, "limit": limit})
        )
        if _HAS_TAVILY_SDK:
            logging.info(
                "Using Tavily SDK to execute search (with enforced timeout)..."
            )
            client = TavilyClient(TAVILY_API_KEY)
            # Run the SDK call in a separate thread so we can enforce a timeout
            sdk_timeout = int(os.getenv("TAVILY_SDK_TIMEOUT", "15"))
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(client.search, query=query)
                try:
                    resp = future.result(timeout=sdk_timeout)
                except concurrent.futures.TimeoutError:
                    logging.error(
                        "Tavily SDK call timed out after %d seconds", sdk_timeout
                    )
                    try:
                        future.cancel()
                    except Exception:
                        pass
                    return {
                        "error": "request_timeout",
                        "message": f"SDK call timed out after {sdk_timeout} seconds",
                    }
                except Exception:
                    logging.exception("Exception during Tavily SDK call")
                    return {"error": "request_failed", "message": "SDK call exception"}
        else:
            logging.warning(
                "Tavily SDK not available or not configured; returning fallback."
            )
            return {"fallback": True, "results": [], "message": "Tavily not configured"}

        logging.info("Tavily returned response type: %s", type(resp))
        if isinstance(resp, dict):
            logging.info("Response keys: %s", list(resp.keys()))
            if "results" in resp:
                logging.info("Number of results: %d", len(resp.get("results", [])))
        # Try to log a truncated serialized view of the response for debugging
        try:
            resp_text = json.dumps(resp)
        except Exception:
            resp_text = repr(resp)
        logging.debug(
            "Tavily raw response (truncated 2000 chars): %s", resp_text[:2000]
        )
        # Try to respect the `limit` param when possible by slicing common shapes.
        if (
            isinstance(resp, dict)
            and "results" in resp
            and isinstance(resp["results"], list)
        ):
            resp["results"] = resp["results"][:limit]
        elif isinstance(resp, list):
            resp = resp[:limit]
        logging.info("Returning Tavily response (truncated to limit=%d)", limit)
        return resp

    except Exception as exc:
        # Log concise message at WARNING and full exception at DEBUG to avoid noisy traces
        logging.error("=== TAVILY SEARCH FAILED ===")
        logging.error("Query was: %s", query)
        logging.error("Exception: %s", exc)
        logging.debug("Tavily request exception details", exc_info=exc)
        # Return structured error so callers can decide how to proceed
        result: Dict[str, Any] = {
            "error": "request_failed",
            "message": str(exc),
        }
        try:
            # include response text when available for debugging
            if (
                isinstance(exc, requests.exceptions.RequestException)
                and hasattr(exc, "response")
                and exc.response is not None
            ):
                result["status_code"] = exc.response.status_code
                result["response_text"] = exc.response.text[:2000]
        except Exception:
            pass
        return result


def extract_snippets(result: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Optional helper to normalise tavily results into a list of snippets.

    This function tries to be tolerant of different Tavily response shapes.
    """
    if not isinstance(result, dict):
        return []
    # If the result is an error payload, return empty snippets
    if result.get("error"):
        return []
    # Common keys that may contain hits
    for key in ("results", "items", "documents", "hits"):
        if key in result and isinstance(result[key], list):
            return result[key]
    return []
