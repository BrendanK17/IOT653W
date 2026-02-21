# ── Build stage ────────────────────────────────────────────────────────────────
FROM python:3.13-slim AS builder

# Install Poetry
RUN pip install --no-cache-dir poetry==2.1.1

WORKDIR /app

# Copy dependency files first to leverage Docker layer caching
COPY pyproject.toml poetry.lock ./

# Configure Poetry:
#   - Do not create a virtual environment (we are already inside a container)
#   - Do not prompt for input
RUN poetry config virtualenvs.create false \
    && poetry install --no-root --no-interaction --no-ansi

# ── Runtime stage ───────────────────────────────────────────────────────────────
FROM python:3.13-slim

WORKDIR /app

# Copy installed packages from the builder stage
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application source code
COPY . .

# Expose the application port
EXPOSE 8000

# NOTE: --host is set to 0.0.0.0 so the server is reachable outside the container.
#       Using 127.0.0.1 (loopback) inside Docker would make the app inaccessible.
CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
