from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import api
from app.routers import auth as auth_router

app = FastAPI(title="GroundScanner Backend")

# Allow requests from your frontend (e.g. localhost:3000)
origins = [
    # Common dev origins (localhost and 127.0.0.1 with common dev ports)
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # Optional: include the backend origin for tooling
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return await auth_module.login(req, response)


@app.post("/register")
async def register_alias(req: auth_schemas.RegisterRequest):
    # FastAPI will validate the request body against the schema and return 422 on error
    return await auth_module.register(req)


@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI backend!"}
