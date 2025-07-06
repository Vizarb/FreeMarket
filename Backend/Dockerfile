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

COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

CMD ["sh", "/app/startup.sh"]