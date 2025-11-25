## Running the Backend

This project uses **FastAPI** with **Uvicorn** as the ASGI server.  
Dependencies are managed using **Poetry**.

### Start the backend

1. Open a terminal and navigate to the backend folder:

```bash
cd backend
```

2. Run the backend using Poetry

```bash
poetry run uvicorn app.main:app --reload
```

app.main:app refers to the FastAPI instance named app inside backend/app/main.py.

--reload enables automatic reloading on code changes (development mode).

Access the API

Open your browser or API client at:

```bash
http://127.0.0.1:8000
```
F
Interactive Swagger docs:
```bash
http://127.0.0.1:8000/docs
```

Alternative ReDoc documentation:

```bash
http://127.0.0.1:8000/redoc
```

To check and fix formatting and type errors:

Run poetry run black . to auto-format your code.
Run poetry run mypy app/ to check for type errors.
If mypy reports missing stubs, install them using poetry run pip install types-<package>.
Fix any remaining errors as reported by mypy.