from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId


def now():
    return datetime.now(timezone.utc)


class User:
    def __init__(self, email: str, hashed_password: str, verified: bool = False):
        self.email = email.lower()
        self.hashed_password = hashed_password
        self.verified = verified
        self.created_at = now()
        self.updated_at = now()


class RefreshTokenDoc:
    def __init__(self, user_id: ObjectId, token_hash: str, expires_at: datetime):
        self.user_id = user_id
        self.token_hash = token_hash
        self.created_at = now()
        self.expiresAt = expires_at
        self.revoked = False


class VerificationTokenDoc:
    def __init__(self, user_id: ObjectId, token_hash: str, expires_at: datetime):
        self.user_id = user_id
        self.token_hash = token_hash
        self.created_at = now()
        self.expiresAt = expires_at


class PasswordResetTokenDoc:
    def __init__(self, user_id: ObjectId, token_hash: str, expires_at: datetime):
        self.user_id = user_id
        self.token_hash = token_hash
        self.created_at = now()
        self.expiresAt = expires_at
