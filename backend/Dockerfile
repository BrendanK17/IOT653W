FROM python:3.13-slim

WORKDIR /app

RUN pip install --no-cache-dir poetry

# Copy dependency files first for layer caching
COPY pyproject.toml poetry.lock ./

RUN poetry config virtualenvs.create false \
    && poetry install --only main --no-root --no-interaction --no-ansi

# Copy application code
COPY app/ app/

EXPOSE 8000

# Bind to 0.0.0.0 so the service is reachable from outside the container.
# --reload is for development only; remove it for production.
CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
