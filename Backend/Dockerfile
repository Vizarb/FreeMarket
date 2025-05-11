# Use an official Python runtime as the base image
FROM python:3.12.10-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements files into the container
COPY requirements.txt dev-requirements.txt /app/

# Install Python dependencies (runtime + dev/test)
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir -r dev-requirements.txt

# Copy the rest of the application code into the container
COPY . /app/

# Ensure the logs directory exists in case volume mapping fails
RUN mkdir -p /logs

# Expose the Django development server port
EXPOSE 8000

# Default command to run the Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
