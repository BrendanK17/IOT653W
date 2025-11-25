import os
import uuid
from fastapi.testclient import TestClient
from app.main import app

# Ensure cookies are allowed in test environment
os.environ.setdefault("REFRESH_COOKIE_SECURE", "false")

client = TestClient(app)


def random_email():
    return f"test+{uuid.uuid4().hex}@example.com"


def random_password():
    return uuid.uuid4().hex + "A1!"


def test_auth_full_flow():
    email = random_email()
    password = random_password()
    new_password = random_password()

    # Register
    r = client.post("/auth/register", json={"email": email, "password": password})
    assert r.status_code == 201
    data = r.json()
    assert "verify_link" in data

    # Verify email using returned link (extract token)
    verify_link = data["verify_link"]
    # link format: /auth/verify-email?email=...&token=...
    assert "token=" in verify_link
    # parse query params
    _, qs = verify_link.split("?", 1)
    params = dict(p.split("=", 1) for p in qs.split("&"))
    r = client.get("/auth/verify-email", params=params)
    assert r.status_code == 200

    # Login
    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body
    # cookie should be set in client
    assert (
        client.cookies.get(os.getenv("REFRESH_COOKIE_NAME", "refresh_token"))
        is not None
    )

    # Request password reset
    r = client.post("/auth/reset-password-request", json={"email": email})
    assert r.status_code == 200
    data = r.json()
    assert "reset_link" in data
    _, qs = data["reset_link"].split("?", 1)
    params = dict(p.split("=", 1) for p in qs.split("&"))
    token = params.get("token")
    assert token

    # Reset password using token
    r = client.post(
        "/auth/reset-password", json={"token": token, "password": new_password}
    )
    assert r.status_code == 200

    # Login with new password
    r = client.post("/auth/login", json={"email": email, "password": new_password})
    assert r.status_code == 200

    # Finally delete account
    r = client.post(
        "/auth/delete-account", json={"email": email, "password": new_password}
    )
    assert r.status_code == 200
