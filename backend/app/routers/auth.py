from fastapi import APIRouter, HTTPException, Depends, Response, Request, Cookie, status
from app.auth import schemas, services
from app.auth.services import (
    find_user_by_email,
    create_user,
    verify_password,
    create_access_and_refresh_tokens,
    generate_and_store_verification_token,
    confirm_verification_token,
    generate_and_store_password_reset_token,
    confirm_and_consume_reset_token,
    revoke_all_user_refresh_tokens,
    verify_and_rotate_refresh_token,
)
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId
from datetime import timedelta
import os
import re

router = APIRouter(prefix="/auth", tags=["auth"])

# cookie settings
REFRESH_COOKIE_NAME = os.getenv("REFRESH_COOKIE_NAME", "refresh_token")
REFRESH_COOKIE_MAX_AGE = int(os.getenv("REFRESH_COOKIE_MAX_AGE", 60 * 60 * 24 * 30))
# allow disabling Secure flag for local development (set to "false")
REFRESH_COOKIE_SECURE = os.getenv("REFRESH_COOKIE_SECURE", "true").lower() in (
    "1",
    "true",
    "yes",
)


@router.post("/register", status_code=201)
async def register(req: schemas.RegisterRequest):
    # Server-side password policy enforcement
    pwd = req.password
    rules = {
        "minLength": len(pwd) >= 8,
        "hasLower": bool(re.search(r"[a-z]", pwd)),
        "hasUpper": bool(re.search(r"[A-Z]", pwd)),
        "hasNumber": bool(re.search(r"[0-9]", pwd)),
        "hasSpecial": bool(re.search(r"[^A-Za-z0-9]", pwd)),
    }
    unmet = [k for k, ok in rules.items() if not ok]
    if unmet:
        raise HTTPException(
            status_code=400,
            detail={"error": "Password does not meet requirements", "unmet": unmet},
        )

    existing = find_user_by_email(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = create_user(req.email, req.password)
    # create verification token (in real app, email this link)
    token = generate_and_store_verification_token(user["_id"])
    verify_link = f"/auth/verify-email?email={user['email']}&token={token}"
    return {"message": "Registered", "verify_link": verify_link}


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login")
async def login(req: schemas.LoginRequest, response: Response):
    user = find_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    if not verify_password(user["hashed_password"], req.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    tokens = create_access_and_refresh_tokens(user)
    # set refresh token cookie (HttpOnly, Secure, SameSite=Strict)
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=tokens["refresh_token"],
        httponly=True,
        secure=REFRESH_COOKIE_SECURE,
        samesite="strict",
        max_age=REFRESH_COOKIE_MAX_AGE,
        path="/",
    )
    return {"access_token": tokens["access_token"], "token_type": "bearer"}


@router.post("/logout")
async def logout(response: Response, refresh_token: Optional[str] = Cookie(None)):
    if refresh_token:
        t_hash = services.hash_token(refresh_token)
        services.revoke_refresh_token_by_hash(t_hash)
    # clear cookie
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/")
    return {"message": "Logged out"}


@router.post("/refresh")
async def refresh(response: Response, refresh_token: Optional[str] = Cookie(None)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    # find token doc
    t_hash = services.hash_token(refresh_token)
    doc = services.refresh_col.find_one({"token_hash": t_hash})
    if not doc:
        # token not found -> possible reuse. We can't determine user safely.
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id = doc["user_id"]
    new_token = services.verify_and_rotate_refresh_token(refresh_token, user_id)
    if not new_token:
        raise HTTPException(
            status_code=401, detail="Refresh token invalid or reuse detected"
        )
    # issue new access token
    user = services.users_col.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid refresh token user")
    access = services.create_access_token(
        {"sub": str(user_id), "email": user["email"]},
        expires_minutes=int(os.getenv("ACCESS_TOKEN_MINUTES", 10)),
    )
    # set cookie
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=new_token,
        httponly=True,
        secure=REFRESH_COOKIE_SECURE,
        samesite="strict",
        max_age=REFRESH_COOKIE_MAX_AGE,
        path="/",
    )
    return {"access_token": access, "token_type": "bearer"}


@router.get("/verify-email")
async def verify_email(email: str, token: str):
    ok = confirm_verification_token(email, token)
    if not ok:
        raise HTTPException(
            status_code=400, detail="Invalid or expired verification token"
        )
    return {"message": "Email verified"}


@router.post("/reset-password-request")
async def reset_password_request(req: schemas.ResetPasswordRequest):
    user = find_user_by_email(req.email)
    if not user:
        # do not reveal existence
        return {"message": "If that account exists, a reset link was sent"}
    token = generate_and_store_password_reset_token(user["_id"])
    reset_link = f"/auth/reset-password?token={token}"
    # In production, email the link. For example/demo return it.
    return {"message": "Password reset requested", "reset_link": reset_link}


@router.post("/reset-password")
async def reset_password(body: schemas.ResetPasswordConfirm):
    # Validate new password server-side
    pwd = body.password
    if (
        len(pwd) < 8
        or not re.search(r"[a-z]", pwd)
        or not re.search(r"[A-Z]", pwd)
        or not re.search(r"[0-9]", pwd)
        or not re.search(r"[^A-Za-z0-9]", pwd)
    ):
        raise HTTPException(
            status_code=400, detail="Password does not meet complexity requirements"
        )

    user_id = confirm_and_consume_reset_token(body.token)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    services.set_user_password(user_id, body.password)
    # revoke existing refresh tokens
    revoke_all_user_refresh_tokens(user_id)
    return {"message": "Password has been reset"}


@router.post("/delete-account")
async def delete_account(req: schemas.LoginRequest, response: Response):
    user = find_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(user["hashed_password"], req.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # remove user and related tokens
    services.users_col.delete_one({"_id": user["_id"]})
    services.refresh_col.delete_many({"user_id": user["_id"]})
    services.verify_col.delete_many({"user_id": user["_id"]})
    services.pwreset_col.delete_many({"user_id": user["_id"]})
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/")
    return {"message": "Account deleted"}
