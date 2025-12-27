import pytest
from unittest.mock import patch, MagicMock
from app.services import climatiq, mongodb
import requests


def test_fallback_to_mongodb_when_climatiq_api_error(monkeypatch):
    # Mock mongodb functions
    with patch('app.services.climatiq.save_climatiq_response'), \
         patch('app.services.climatiq.get_latest_climatiq_response', return_value={"activity_id": "mock_id", "name": "Mock Name"}):
        
        # Prepare test query params and expected MongoDB response
        query_params = {
            "query": "train",
            "data_version": "27",
            "source": "BEIS",
            "sector": "Transport",
            "year": 2025,
            "region": "GB",
            "lca_activity": "well_to_tank",
        }
        expected_response = {"activity_id": "mock_id", "name": "Mock Name"}

        # Insert mock response into MongoDB (mocked)
        climatiq.save_climatiq_response(query_params, expected_response)

        # Mock requests.get to raise HTTPError
        class MockResponse:
            ok = False
            status_code = 500
            text = "Internal Server Error"
            url = "http://mocked.url"

            def raise_for_status(self):
                raise requests.HTTPError("Mocked HTTP error")

            def json(self):
                return {"results": []}

        monkeypatch.setattr("requests.get", lambda *args, **kwargs: MockResponse())

        # Should fallback to MongoDB and return expected_response
        result = climatiq.get_emission_factors("train", "GB", "well_to_tank")
        assert result["activity_id"] == expected_response["activity_id"]
        assert result["name"] == expected_response["name"]
