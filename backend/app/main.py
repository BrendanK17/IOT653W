from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import api

app = FastAPI(title="My FastAPI Backend")

# Allow requests from your frontend (e.g. localhost:3000)
origins = [
    "http://localhost:3000",  # adjust to your frontend dev server
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

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI backend!"}
