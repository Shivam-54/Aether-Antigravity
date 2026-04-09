FROM python:3.11-slim

WORKDIR /app

# System dependencies needed for building packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install CPU-only PyTorch first (200MB vs 2GB GPU version — saves huge space)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install Python dependencies
COPY requirements-deploy.txt .
RUN pip install --no-cache-dir -r requirements-deploy.txt

# Copy application code
COPY . .

# Create uploads directory (ephemeral but needed for routes)
RUN mkdir -p uploads

# Set deployment environment variables
ENV DEPLOY_MODE=huggingface
ENV PORT=7860

# HF Spaces uses port 7860 by default
EXPOSE 7860

# Start server (single worker — HF free tier has limited CPU)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]
