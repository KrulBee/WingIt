# AI Server Dockerfile for Render deployment
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements_deploy.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements_deploy.txt

# Copy source code and model
COPY . .

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "real_ai_server.py"]
