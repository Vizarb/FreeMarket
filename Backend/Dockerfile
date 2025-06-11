# Use an official Python runtime as the base image
FROM python:3.12.10-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker caching
COPY requirements.txt dev-requirements.txt /app/

# Install Python dependencies
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir -r dev-requirements.txt

# Copy the entire Django app
COPY . /app/

# Create logs directory in case volume doesn't mount
RUN mkdir -p /logs

# Expose Django default dev port
EXPOSE 8000

# The actual run command will be handled by docker-compose
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
