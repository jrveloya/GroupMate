# Use a slim Python base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies and clean up in the same layer
# RUN apt-get update && \
#     apt-get install -y --no-install-recommends gcc libpq-dev && \
#     apt-get purge -y --auto-remove && \
#     rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code in smaller chunks (helps with layer size and caching)
COPY app/ ./app/
COPY run.py .

# Expose the port the app runs on
EXPOSE 5050

# Command to run the application
CMD ["python", "run.py"]