from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from bson import ObjectId
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import hashlib
from app.services.mongodb import client, DB_NAME
from .utils import generate_token_string, hash_token, create_access_token
import os
from jose import JWTError, jwt

ph = PasswordHasher()

# collections
db = client[DB_NAME]
users_col = db.get_collection("users")
refresh_col = db.get_collection("refreshTokens")
verify_col = db.get_collection("verificationTokens")
pwreset_col = db.get_collection("passwordResetTokens")

# settings
ACCESS_TOKEN_MINUTES = int(os.getenv("ACCESS_TOKEN_MINUTES", "10"))
REFRESH_TOKEN_DAYS = int(os.getenv("REFRESH_TOKEN_DAYS", "30"))
VERIFICATION_TOKEN_HOURS = int(os.getenv("VERIFICATION_TOKEN_HOURS", "24"))
RESET_TOKEN_HOURS = int(os.getenv("RESET_TOKEN_HOURS", "2"))


def create_indexes():
    # TTL indexes on expiresAt fields (expireAfterSeconds = 0 -> expire at field value)
    refresh_col.create_index("expiresAt", expireAfterSeconds=0)
    verify_col.create_index("expiresAt", expireAfterSeconds=0)
    pwreset_col.create_index("expiresAt", expireAfterSeconds=0)
    users_col.create_index("email", unique=True)


# Run index creation once
try:
    create_indexes()
except Exception:
    # ignore in environments where indexes exist or during tests
    pass


def hash_password(password: str) -> str:
    return ph.hash(password)


def verify_password(hash: str, password: str) -> bool:
    try:
        return ph.verify(hash, password)
    except VerifyMismatchError:
        return False


def create_user(email: str, password: str) -> dict:
    hashed = hash_password(password)
    doc = {
        "email": email.lower(),
        "hashed_password": hashed,
        "verified": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    res = users_col.insert_one(doc)
    doc["_id"] = res.inserted_id
    return doc


def find_user_by_email(email: str) -> Optional[dict]:
    return users_col.find_one({"email": email.lower()})


def generate_and_store_verification_token(user_id: ObjectId) -> str:
    token = generate_token_string()
    token_hash = hash_token(token)
    expires = datetime.now(timezone.utc) + timedelta(hours=VERIFICATION_TOKEN_HOURS)
    verify_col.insert_one(
        {
            "user_id": user_id,
            "token_hash": token_hash,
            "created_at": datetime.now(timezone.utc),
            "expiresAt": expires,
        }
    )
    return token


def confirm_verification_token(email: str, token: str) -> bool:
    user = find_user_by_email(email)
    if not user:
        return False
    token_hash = hash_token(token)
    doc = verify_col.find_one_and_delete(
        {"user_id": user["_id"], "token_hash": token_hash}
    )
    if not doc:
        return False
    users_col.update_one(
        {"_id": user["_id"]},
        {"$set": {"verified": True, "updated_at": datetime.now(timezone.utc)}},
    )
    return True


def generate_and_store_password_reset_token(user_id: ObjectId) -> str:
    token = generate_token_string()
    token_hash = hash_token(token)
    expires = datetime.now(timezone.utc) + timedelta(hours=RESET_TOKEN_HOURS)
    pwreset_col.insert_one(
        {
            "user_id": user_id,
            "token_hash": token_hash,
            "created_at": datetime.now(timezone.utc),
            "expiresAt": expires,
        }
    )
    return token


def confirm_and_consume_reset_token(token: str) -> Optional[ObjectId]:
    token_hash = hash_token(token)
    doc = pwreset_col.find_one_and_delete({"token_hash": token_hash})
    if not doc:
        return None
    return doc["user_id"]


def create_refresh_token_doc(user_id: ObjectId) -> Tuple[str, dict]:
    token = generate_token_string()
    token_hash = hash_token(token)
    expires = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_DAYS)
    doc = {
        "user_id": user_id,
        "token_hash": token_hash,
        "created_at": datetime.now(timezone.utc),
        "expiresAt": expires,
        "revoked": False,
    }
    refresh_col.insert_one(doc)
    return token, doc


def revoke_refresh_token_by_hash(token_hash: str):
    refresh_col.update_many({"token_hash": token_hash}, {"$set": {"revoked": True}})


def revoke_all_user_refresh_tokens(user_id: ObjectId):
    refresh_col.update_many({"user_id": user_id}, {"$set": {"revoked": True}})


def verify_and_rotate_refresh_token(token: str, user_id: ObjectId) -> Optional[str]:
    t_hash = hash_token(token)
    doc = refresh_col.find_one({"token_hash": t_hash})
    if not doc:
        # possible token reuse - revoke all for user
        revoke_all_user_refresh_tokens(user_id)
        return None
    if doc.get("revoked"):
        # token already revoked -> revoke all
        revoke_all_user_refresh_tokens(user_id)
        return None
    # rotate: revoke current and insert new
    refresh_col.update_one({"_id": doc["_id"]}, {"$set": {"revoked": True}})
    new_token, _ = create_refresh_token_doc(user_id)
    return new_token


def create_access_and_refresh_tokens(user: dict) -> dict:
    access = create_access_token(
        {"sub": str(user["_id"]), "email": user["email"]},
        expires_minutes=ACCESS_TOKEN_MINUTES,
    )
    refresh_token, _ = create_refresh_token_doc(user["_id"])
    return {"access_token": access, "refresh_token": refresh_token}


def set_user_password(user_id: ObjectId, password: str):
    hashed = hash_password(password)
    users_col.update_one(
        {"_id": user_id},
        {"$set": {"hashed_password": hashed, "updated_at": datetime.now(timezone.utc)}},
    )
