# GroundScanner Backend API

Backend service for the GroundScanner travel comparison platform. Provides REST APIs for airport data, transport options, pricing, sustainability metrics, and user authentication.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running Locally](#running-locally)
- [API Documentation](#api-documentation)
- [Available Commands](#available-commands)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Overview

This backend service provides:

- **Airport Data** - Comprehensive airport information, terminal details, and transport options
- **Terminal Transfers** - Detailed guidance on getting between airport terminals
- **Transport Options** - Multiple transport modes (train, bus, taxi, subway) with pricing
- **Sustainability Metrics** - CO₂ emissions tracking via Climatiq integration
- **User Authentication** - Secure JWT-based account management with role support
- **AI Agent** - Intelligent airport recommendations using local LLMs (Ollama)
- **Search Integration** - Real-time data from Tavily search API
- **Fare Intelligence** - City fare summaries and fare trend analysis
- **Data Caching** - MongoDB for persistent data storage and quick retrieval

## 🛠️ Tech Stack

- **Framework**: FastAPI 0.121+
- **Server**: Uvicorn 0.38+
- **Package Manager**: Poetry
- **Database**: MongoDB 4.15+
- **Python**: 3.13+
- **Testing**: pytest
- **Code Quality**: black, mypy

## 📋 Prerequisites

Before you begin, ensure you have:

- **Python 3.13+** - [Download](https://www.python.org/)
- **Poetry** - [Install Guide](https://python-poetry.org/docs/#installation)
- **MongoDB** - [Local setup](https://docs.mongodb.com/manual/installation/) or use MongoDB Atlas
- **Ollama** (optional) - For local LLM support
- **Git** - For version control

Verify your Python and Poetry installation:

```bash
python --version
poetry --version
```

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd IOT653U/backend
```

### 2. Install Dependencies

```bash
poetry install
```

This command:
- Creates a virtual environment
- Installs all dependencies from `pyproject.toml`
- Sets up development tools (black, mypy, pytest)

### 3. Verify Installation

```bash
poetry run python -c "import fastapi; print(f'FastAPI {fastapi.__version__} installed')"
```

## 🔧 Environment Setup

### Create Environment File

Create a `.env` file in the `backend/` directory:

```env
# API Configuration
DEBUG=True
ENVIRONMENT=development

# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=groundscanner

# Authentication
JWT_SECRET_KEY=your-super-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External Services
TAVILY_API_KEY=your-tavily-api-key
CLIMATIQ_API_KEY=your-climatiq-api-key

# LLM Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral
```

**Important**: Never commit `.env` to version control. It's already in `.gitignore`.

## 🚀 Running Locally

### Start the Backend Server

```bash
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Options explained**:
- `--reload`: Auto-restart on code changes (development mode only)
- `--host 127.0.0.1`: Listen on localhost
- `--port 8000`: Use port 8000

### Verify Server is Running

You should see output like:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

## 📚 API Documentation

Once the server is running, access documentation at:

### Interactive Swagger UI (Recommended)
```
http://127.0.0.1:8000/docs
```

### Alternative ReDoc Documentation
```
http://127.0.0.1:8000/redoc
```

### OpenAPI Schema
```
http://127.0.0.1:8000/openapi.json
```

## 🔌 API Endpoints

### Authentication Routes

```
POST /login              # User login with email & password
POST /register           # User registration
POST /logout             # User logout
```

### Airport Endpoints

```
GET  /example            # Example endpoint
GET  /airports/*         # Airport data & information
GET  /airport-transports/* # Transport options for airport
GET  /terminal-transfers/* # Terminal transfer information
```

### Integration Endpoints

```
GET  /llm                # Query Ollama LLM (local)
GET  /climatiq           # Get CO₂ emission factors
GET  /city-center/*      # City center information
GET  /fares/*            # City fare data & analysis
```

For detailed parameter documentation, visit the Swagger UI at `/docs`

## 🔗 External Service Integration

### Required Services

1. **MongoDB** - Database for storing airports, transports, users
   - Local: `mongodb://localhost:27017`
   - Atlas: Update `MONGODB_URL` in `.env`

2. **Ollama** (Optional) - Local LLM for recommendations
   - Download: https://ollama.ai/
   - Model: `mistral` (configurable)
   - URL: `http://localhost:11434` (default)
   - Features: Airport suggestions, fare analysis, recommendations

### Optional APIs

3. **Tavily Search** - Web search for real-time transport info
   - Sign up: https://tavily.com/
   - Set `TAVILY_API_KEY` in `.env`
   - Fallback to cached data if not configured

4. **Climatiq** - CO₂ emissions tracking
   - Sign up: https://www.climatiq.io/
   - Set `CLIMATIQ_API_KEY` in `.env`
   - Fallback to estimates if not configured

### Service Status

All services are optional with graceful fallbacks. The backend will:
- Use Ollama if available, otherwise return basic data
- Use Tavily for search if available, otherwise use cached data
- Use Climatiq for emissions if available, otherwise use estimation

## ⚙️ Available Commands

### Development

```bash
# Run development server with auto-reload
poetry run uvicorn app.main:app --reload

# Run with specific settings
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Interactive Python shell with app context
poetry run python
```

### Testing

```bash
# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=app --cov-report=html

# Run specific test file
poetry run pytest tests/test_auth_flow.py

# Run with verbose output
poetry run pytest -v

# Run in watch mode
poetry run pytest-watch
```

### Code Quality

```bash
# Format code with black
poetry run black .

# Check formatting without changing files
poetry run black --check .

# Type check with mypy
poetry run mypy app/

# Fix common type issues
poetry run mypy app/ --install-types
```

## 📁 Project Structure

```
backend/
├── app/                           # Main application package
│   ├── __init__.py
│   ├── main.py                    # FastAPI app entry point with CORS & middleware
│   │
│   ├── core/
│   │   └── config.py              # Configuration & environment settings
│   │
│   ├── auth/                      # Authentication module
│   │   ├── models.py              # User & token database models
│   │   ├── schemas.py             # Request/response data schemas
│   │   ├── services.py            # Auth business logic
│   │   └── utils.py               # Password hashing & validation
│   │
│   ├── routers/                   # API endpoints (routes)
│   │   ├── api.py                 # Main API routes (~1000 lines)
│   │   │   ├── /example           # Example endpoint
│   │   │   ├── /llm               # Ollama LLM queries
│   │   │   ├── /climatiq          # Emission factor queries
│   │   │   ├── /airports/*        # Airport endpoints
│   │   │   ├── /city-center/*     # City center info
│   │   │   ├── /terminal-transfers/* # Terminal navigation
│   │   │   └── /fares/*           # Fare information
│   │   │
│   │   └── auth.py                # Authentication routes
│   │       ├── POST /login        # User login
│   │       ├── POST /register     # User registration
│   │       └── POST /logout       # User logout
│   │
│   ├── utils/                     # Utility functions
│   │   ├── __init__.py            # Common utilities (sanitize, validate)
│   │   └── __pycache__/
│   │
│   └── services/                  # Business logic & external integrations
│       ├── airports.py            # Airport data management
│       ├── airport_agent.py       # AI agent for airport lookup
│       ├── airport_prompt.py      # LLM prompt templates for airports
│       ├── airport_transports.py  # Transport options per airport
│       ├── city_center_prompt.py  # LLM prompt for city centers
│       ├── city_fares.py          # City fare data & summaries
│       ├── city_fare_prompt.py    # LLM prompt for fares
│       ├── climatiq.py            # Climatiq CO₂ emission integration
│       ├── mongodb.py             # MongoDB database operations
│       ├── ollama.py              # Local LLM (Ollama) integration
│       ├── tavily.py              # Tavily search API integration
│       ├── terminal_transfers_prompt.py # Terminal transfer prompts
│       ├── transport_prompt.py    # Transport-related prompts
│       └── __pycache__/
│
├── scripts/
│   ├── verify_airports.py         # Utility for airport data verification
│   └── __pycache__/
│
├── tests/                         # Test suite
│   ├── conftest.py                # Pytest configuration & fixtures
│   ├── test_auth_flow.py          # Authentication flow tests
│   ├── test_climatiq_fallback.py  # Climatiq integration tests
│   ├── __pycache__/
│   └── ...
│
├── pyproject.toml                 # Poetry config & dependency management
├── README.md                      # This file
└── agent/                         # AI agent directory (optional)
```

## 🧪 Testing

### Running Tests

```bash
# All tests
poetry run pytest

# With coverage report
poetry run pytest --cov=app --cov-report=html

# Specific test
poetry run pytest tests/test_auth_flow.py::test_user_registration
```

### Test Organization

- **Unit Tests**: Test individual functions and services
- **Integration Tests**: Test API endpoints with mocked external services
- **Fixtures**: Shared test setup in `conftest.py`

### Example Test

```python
def test_airport_search(client):
    """Test airport search returns results"""
    response = client.get("/api/airports/search?q=London")
    assert response.status_code == 200
    assert len(response.json()) > 0
```

## ✅ Code Quality

### Before Committing Code

1. **Format code**:
   ```bash
   poetry run black .
   ```

2. **Type check**:
   ```bash
   poetry run mypy app/
   ```

3. **Run tests**:
   ```bash
   poetry run pytest
   ```

4. **Check coverage**:
   ```bash
   poetry run pytest --cov=app
   ```

### Code Standards

- ✅ Type hints on all functions
- ✅ Docstrings on public functions
- ✅ No implicit `any` types
- ✅ PEP 8 compliant (enforced by black)
- ✅ All tests passing

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Use a different port
poetry run uvicorn app.main:app --reload --port 8001
```

### MongoDB Connection Error

```
pymongo.errors.ServerSelectionTimeoutError
```

**Solution**: 
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- For Atlas: verify IP whitelist includes your machine

### Module Not Found Error

```bash
# Reinstall dependencies
poetry install

# Clear cache
poetry install --no-cache
```

### Tests Fail With Import Errors

```bash
# Ensure pytest has access to app
poetry run pytest --pythonpath=.
```

### Type Checking Fails

```bash
# Install missing type stubs
poetry run mypy app/ --install-types

# Or install specific package
poetry run pip install types-requests
```

## 🤝 Contributing

### Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test:
   ```bash
   poetry run pytest
   poetry run black .
   poetry run mypy app/
   ```

3. Commit with clear messages:
   ```bash
   git commit -m "feat: add new API endpoint for airport search"
   ```

4. Push and create a Pull Request:
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Review Checklist

- [ ] Tests pass (`poetry run pytest`)
- [ ] Types check (`poetry run mypy app/`)
- [ ] Code is formatted (`poetry run black .`)
- [ ] New features have tests
- [ ] Documentation updated
- [ ] No hardcoded secrets or sensitive data

## 📞 Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review existing GitHub issues
3. Create a new issue with:
   - Error message/traceback
   - Steps to reproduce
   - Your environment (Python version, OS, etc.)

---

**Last Updated**: January 2026  
**Built with ❤️ by the GroundScanner Team**