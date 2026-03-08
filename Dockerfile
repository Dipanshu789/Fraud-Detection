# Build Stage for PyG dependencies if needed, but wheel install is faster
FROM python:3.11-slim

# Prevents Python from writing .pyc files and ensures output is sent to stdout/stderr
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU first
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install Graph Neural Network dependencies & API packages
RUN pip install --no-cache-dir \
    torch_geometric \
    fastapi \
    uvicorn \
    pydantic \
    pydantic-settings \
    prometheus_client \
    pandas \
    redis \
    httpx

# Copy source code and artifacts
COPY src/ /app/src/
COPY config/ /app/config/
COPY Data/ /app/Data/

# Port for FastAPI
EXPOSE 8000

# Healthcheck to verify API is responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/health/health || exit 1

# Start the application with multiple workers for production
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
