import secrets
import hashlib
from datetime import datetime, timedelta, timezone
import os
from jose import jwt

# Prefer AUTH_SECRET_KEY, fall back to SECRET_KEY. Ensure a non-empty string for mypy.
_secret = os.getenv("SECRET_KEY")
if not _secret:
    raise RuntimeError("SECRET_KEY must be set in the environment")
SECRET_KEY: str = _secret

ALGORITHM = "HS256"


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def generate_token_string(length: int = 48) -> str:
    return secrets.token_urlsafe(length)


def create_access_token(data: dict, expires_minutes: int = 10) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
