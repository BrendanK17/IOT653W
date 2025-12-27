import os
import uuid
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Ensure cookies are allowed in test environment
os.environ.setdefault("REFRESH_COOKIE_SECURE", "false")


def random_email():
    return f"test+{uuid.uuid4().hex}@example.com"


def random_password():
    return "Password1!"


def test_auth_full_flow():
    email = random_email()
    password = random_password()
    new_password = "NewPassword1!"

    with patch('app.auth.services.find_user_by_email', return_value=None) as mock_find_user, \
         patch('app.auth.services.create_user') as mock_create_user, \
         patch('app.auth.services.generate_and_store_verification_token', return_value='fake_token'), \
         patch('app.auth.services.confirm_verification_token', return_value=True), \
         patch('app.auth.services.verify_password', return_value=True), \
         patch('app.auth.services.create_access_and_refresh_tokens', return_value={'access_token': 'access', 'refresh_token': 'refresh'}), \
         patch('app.auth.services.generate_and_store_password_reset_token', return_value='reset_token'), \
         patch('app.auth.services.confirm_and_consume_reset_token', return_value=True), \
         patch('app.auth.services.revoke_all_user_refresh_tokens'):
        
        from app.main import app  # import inside patch

        mock_user = {"_id": "fake_id", "email": email, "verified": False, "hashed_password": "fake_hash"}
        mock_create_user.return_value = mock_user

        # Create client inside the patch context
        test_client = TestClient(app)

        # Register
        r = test_client.post("/auth/register", json={"email": email, "password": password})
        assert r.status_code == 201
        data = r.json()
        assert "verify_link" in data

        # Update mock user to verified after verification
        mock_user["verified"] = True
        mock_find_user.return_value = mock_user

        # Verify email using returned link (extract token)
        verify_link = data["verify_link"]
        # link format: /auth/verify-email?email=...&token=...
        assert "token=" in verify_link
        # parse query params
        _, qs = verify_link.split("?", 1)
        params = dict(p.split("=", 1) for p in qs.split("&"))
        r = test_client.get("/auth/verify-email", params=params)
        assert r.status_code == 200

        # Login
        r = test_client.post("/auth/login", json={"email": email, "password": password})
        assert r.status_code == 200
        body = r.json()
        assert "access_token" in body
        # cookie should be set in client
        assert (
            test_client.cookies.get(os.getenv("REFRESH_COOKIE_NAME", "refresh_token"))
            is not None
        )

        # Request password reset
        r = test_client.post("/auth/reset-password-request", json={"email": email})
        assert r.status_code == 200
        data = r.json()
        assert "reset_link" in data
        _, qs = data["reset_link"].split("?", 1)
        params = dict(p.split("=", 1) for p in qs.split("&"))
        token = params.get("token")
        assert token

        # Reset password using token
        r = test_client.post(
            "/auth/reset-password", json={"token": token, "password": new_password}
        )
        assert r.status_code == 200

        # Login with new password
        r = test_client.post("/auth/login", json={"email": email, "password": new_password})
        assert r.status_code == 200
