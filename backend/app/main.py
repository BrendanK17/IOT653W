from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers import api
from app.routers import auth as auth_router
from fastapi import Response
from app.routers import auth as auth_module
from app.auth import schemas as auth_schemas
import logging
import os

app = FastAPI(title="GroundScanner Backend")

# Allow requests from your frontend (e.g. localhost:3000)
_default_origins = [
    # Common dev origins (localhost and 127.0.0.1 with common dev ports)
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # Optional: include the backend origin for tooling
    "http://127.0.0.1:8000",
]

# Allow additional origins to be specified via the CORS_ORIGINS environment
# variable as a comma-separated list (e.g. the production ELB frontend URL).
_extra_origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]
origins = _default_origins + _extra_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware to check for frontend header
@app.middleware("http")
async def check_frontend_header(request: Request, call_next):
    # Skip for auth endpoints or if it's a preflight
    if request.method == "OPTIONS" or request.url.path.startswith("/login") or request.url.path.startswith("/register"):
        return await call_next(request)
    
    # Check for custom header
    #if request.headers.get("X-Requested-By") != "GroundScanner-Frontend":
    #    raise HTTPException(status_code=403, detail="Forbidden: Requests must come from the frontend")
    
    response = await call_next(request)
    return response

# Include routers
app.include_router(api.router)
app.include_router(auth_router.router)


# --- Top-level auth aliases so frontend can POST to `/login` and `/register` ---
from fastapi import Response
from app.routers import auth as auth_module
from app.auth import schemas as auth_schemas


@app.post("/login")
async def login_alias(req: auth_schemas.LoginRequest, response: Response):
    # FastAPI will validate the request body against the schema and return 422 on error
    logging.info("Login attempt for email: %s", req.email)
    return await auth_module.login(req, response)


@app.post("/register")
async def register_alias(req: auth_schemas.RegisterRequest):
    # FastAPI will validate the request body against the schema and return 422 on error
    logging.info("Register attempt for email: %s", req.email)
    return await auth_module.register(req)


@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI backend!"}
