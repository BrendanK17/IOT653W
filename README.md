# GroundScanner

GroundScanner is a travel comparison platform for finding the best, cheapest, and most sustainable airport-to-city transfers. This repository is a monorepo containing two main packages:

- `frontend/` — React + TypeScript application (Vite)
- `backend/` — FastAPI service written in Python (Poetry)

This root README consolidates the most important information developers and contributors need to run, test, and contribute to the project. It merges and expands the existing package-level READMEs so there's one canonical place to find documentation.

--

**Table of Contents**

- Overview
- Quick start
- Tech stack
- Prerequisites
- Installation (frontend & backend)
- Environment configuration
- Running locally
- API documentation (backend)
- Frontend development
- Testing
- Code quality and tooling
- Project structure
- Troubleshooting
- Contributing
- License & acknowledgements

--

## Overview

GroundScanner helps travelers choose the best transfer options from an airport to a city center by comparing price, time, accessibility, and CO₂ emissions. The backend provides airport and transport data, AI-driven recommendations (optional local LLM), and integrations for emissions and search. The frontend provides interactive UI, maps, filters, charts, and account features.

## Quick start

These steps get both services running on a development machine.

1. Clone the repository:

```powershell
git clone <repository-url>
cd IOT653U
```

2. Start the backend (in a separate terminal):

```powershell
cd backend
# Create backend/.env following the instructions below
poetry install
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

3. Start the frontend (in another terminal):

```powershell
cd frontend
npm install
npm run dev
```

Open the frontend at the Vite URL (typically `http://127.0.0.1:5173`) and the backend API docs at `http://127.0.0.1:8000/docs`.

## Tech stack

- Frontend: React 18.2, TypeScript 5.2, Vite, Tailwind CSS, ShadCN UI, Leaflet
- Backend: FastAPI, Uvicorn, Python 3.13+, Poetry
- Database: MongoDB (local or Atlas)
- Testing: Vitest (frontend), pytest (backend)
- CI / Code quality: black, mypy, ESLint, tests and coverage

## Prerequisites

- Node.js 18+ and npm 9+ (or Yarn 3+)
- Python 3.13+
- Poetry
- MongoDB local instance or Atlas cluster
- Git

Verify:

```bash
node --version
npm --version
python --version
poetry --version
```

## Installation

Install dependencies for each package separately.

Backend

```powershell
cd backend
poetry install
```

Frontend

```bash
cd frontend
npm install
```

## Environment configuration

You must create a local environment file for secrets and service keys. Never commit this file.

Backend (`backend/.env`) — example values:

```env
MONGODB_CONNECTION_STRING=mongodb://localhost:27017
TAVILY_API_KEY=your-tavily-api-key
CLIMATIQ_API_KEY=your-climatiq-api-key
OLLAMA_API_KEY=abcd
SECRET_KEY=abcd
```

Notes:

- Replace keys and secrets before deploying to production.
- Keep `.env` files out of version control.

## Running locally — Backend

Run the backend dev server with auto-reload:

```powershell
cd backend
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API docs (interactive): `http://127.0.0.1:8000/docs`

### Backend endpoints (high level)

- `POST /login`, `POST /register`, `POST /logout` — authentication
- `GET /api/airports/*` — airport data and search
- `GET /api/airport-transports/*` — transport options for airports
- `GET /api/terminal-transfers/*` — terminal navigation helpers
- `GET /llm` — local Ollama LLM queries (optional)
- `GET /climatiq` — emission factors lookup

The backend integrates with optional services (Ollama, Tavily, Climatiq) and uses graceful fallbacks when keys or services are not configured.

## Running locally — Frontend

Start the dev server:

```bash
cd frontend
npm run dev
```

Open the app at the Vite URL shown in the terminal.

The frontend expects the backend API to be available at the host configured in `VITE_API_URL` (default `http://localhost:8000`). If the backend runs on a different host/port, update `frontend/.env.local` and restart the dev server.

## Testing

Backend

```bash
cd backend
poetry run pytest
# with coverage
poetry run pytest --cov=app --cov-report=html
```

Frontend

```bash
cd frontend
npm test
# or single run
npm run test:run
```

## Code quality & formatting

Backend (Python)

```bash
cd backend
poetry run black .
poetry run mypy app/
```

Frontend (TypeScript)

```bash
cd frontend
npm run type-check
npm run lint
```

## Project structure (high level)

- backend/
  - app/ — FastAPI application package
  - services/ — business logic and integrations (climatiq, tavily, ollama, mongodb)
  - routers/ — API endpoints
  - tests/ — pytest tests
  - pyproject.toml — Poetry configuration

- frontend/
  - components/ — React components
  - utils/ — helpers and API client
  - styles/ — global CSS + Tailwind
  - package.json — scripts & dependencies

## Troubleshooting

- Backend not reachable:
  - Confirm uvicorn is running on port 8000.
  - Check CORS settings if the frontend gets blocked.

- MongoDB connection issues:
  - Ensure `MONGODB_URL` is correct and the database is accessible.
  - For Atlas, confirm IP whitelist and credentials.

- Frontend fails to connect to backend:
  - Confirm `VITE_API_URL` matches backend host/port.
  - Check browser console for CORS or network errors.

- HMR not working (frontend): restart Vite dev server.

## Contributing

1. Fork and create a feature branch: `git checkout -b feature/your-feature`.
2. Run tests and linters locally.
3. Commit with a clear message and open a PR.

Pre-commit checklist:

```bash
# Frontend
cd frontend && npm run type-check && npm test && npm run lint

# Backend
cd backend && poetry run mypy app/ && poetry run pytest && poetry run black --check .
```

Commit message suggestion:

```
feat: add feature description
fix: brief bugfix description
docs: update docs
```

## Security & Secrets

- Never commit `.env` or `.env.local` files.
- Rotate keys and secrets before sharing or deploying.
- Use CI secret stores for production deployments.

## License

This project is licensed under the MIT License — see the `LICENSE` file for details.

## Acknowledgements

- ShadCN, Radix UI, and the open source community for UI and tooling.

--

If you'd like, I can further expand any specific section (detailed API usage examples, deployment guides, or developer onboarding steps).
