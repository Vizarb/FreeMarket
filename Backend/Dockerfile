# Backend/Dockerfile

FROM python:3.12.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt dev-requirements.txt /app/
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir -r dev-requirements.txt

COPY . /app/
RUN mkdir -p /logs

ENV DJANGO_SETTINGS_MODULE=config.settings.prod

EXPOSE 8000

CMD ["gunicorn", "myproj.wsgi:application", "--bind", "0.0.0.0:8000", "--access-logfile", "-", "--error-logfile", "-", "--capture-output"]
