import pytest
from unittest.mock import patch, MagicMock
from app.services import climatiq, mongodb

def test_fallback_to_mongodb_when_climatiq_api_error(monkeypatch):
    # Prepare test query params and expected MongoDB response
    query_params = {
        "query": "train",
        "data_version": "27",
        "region": "GB",
        "lca_activity": "well_to_tank"
    }
    expected_response = {"activity_id": "mock_id", "name": "Mock Name"}

    # Mock MongoDB functions to simulate cache behavior
    saved_data = {}
    
    def mock_save(params, response):
        saved_data[str(params)] = response
    
    def mock_get(params):
        return saved_data.get(str(params))
    
    # Patch the functions in the climatiq module where they are imported
    monkeypatch.setattr("app.services.climatiq.save_climatiq_response", mock_save)
    monkeypatch.setattr("app.services.climatiq.get_latest_climatiq_response", mock_get)

    # Insert mock response into "MongoDB" (our mock)
    mock_save(query_params, expected_response)

    # Mock requests.get to raise HTTPError
    class MockResponse:
        ok = False
        status_code = 500
        text = "Internal Server Error"
        url = "http://mocked.url"
        def raise_for_status(self):
            import requests
            raise requests.HTTPError("Mocked HTTP error")
        def json(self):
            return {"results": []}

    monkeypatch.setattr("requests.get", lambda *args, **kwargs: MockResponse())

    # Should fallback to MongoDB and return expected_response
    result = climatiq.get_emission_factors("train", "GB", "well_to_tank")
    assert result["activity_id"] == expected_response["activity_id"]
    assert result["name"] == expected_response["name"]
