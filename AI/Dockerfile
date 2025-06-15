# AI Server Dockerfile for Render deployment
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements_deploy.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements_deploy.txt

# Pre-download the model during build time (not runtime!)
# This prevents the infinite download loop on Render
RUN echo "Downloading PhoBERT model during Docker build..." && \
    mkdir -p /app/models && \
    wget -O /app/models/best_phobert_model.pth \
    "https://huggingface.co/ViBuck/best_phobert_model/resolve/main/best_phobert_model.pth" && \
    echo "Model downloaded successfully during build." && \
    echo "Model size:" && \
    ls -lh /app/models/best_phobert_model.pth && \
    echo "Verifying model size is at least 100MB..." && \
    [ $(stat -c%s /app/models/best_phobert_model.pth) -gt 104857600 ] && \
    echo "✅ Model validation passed!" || (echo "❌ Model too small!" && exit 1)

# Copy source code
COPY . .

# Set the model path to the pre-downloaded location
ENV MODEL_PATH=/app/models/best_phobert_model.pth

# Expose port
EXPOSE 5000

# Health check to ensure model is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run the application
CMD ["python", "real_ai_server.py"]
