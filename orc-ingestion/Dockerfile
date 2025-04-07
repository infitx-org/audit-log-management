# Base image with Python 3
FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Copy requirements inline (optional but good for cache)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Python script into the container
COPY kafka_s3_sync.py .

# Optional: Copy .env if you're using dotenv (for local use)
# COPY .env .

# Entry point
CMD ["python", "kafka_s3_sync.py"]
