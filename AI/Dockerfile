FROM python:3.10-slim

WORKDIR /app

# Install system dependencies including wget and curl
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir torch transformers flask flask-cors requests psutil numpy

# Create directories
RUN mkdir -p /app/logs /app/models

# Pre-download ALL PhoBERT components during build time
# This prevents any downloads during runtime, making startup instant
RUN echo "Pre-downloading PhoBERT model and tokenizer components..." && \
    python3 -c "import os; from transformers import AutoTokenizer, AutoModel; import torch; print('Downloading PhoBERT tokenizer and base model...'); tokenizer = AutoTokenizer.from_pretrained('vinai/phobert-base'); model = AutoModel.from_pretrained('vinai/phobert-base'); print('PhoBERT base components cached successfully!')" && \
    echo "Downloading trained model weights..." && \
    wget -O /app/models/best_phobert_model.pth \
    "https://huggingface.co/ViBuck/best_phobert_model/resolve/main/best_phobert_model.pth" && \
    echo "All model components downloaded successfully during build." && \
    echo "Trained model size:" && \
    ls -lh /app/models/best_phobert_model.pth && \
    echo "Verifying trained model size is at least 100MB..." && \
    [ $(stat -c%s /app/models/best_phobert_model.pth) -gt 104857600 ] && \
    echo "✅ All model components validated!" || (echo "❌ Model too small!" && exit 1)

# Copy source code
COPY real_ai_server.py .

# Set the model path to the pre-downloaded location
ENV MODEL_PATH=/app/models/best_phobert_model.pth

# Expose port
EXPOSE 5000

# Health check to ensure model is ready - give enough time for model loading
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run the application
CMD ["python", "real_ai_server.py"]
