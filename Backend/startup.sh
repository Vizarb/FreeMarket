#!/bin/bash
set -e

# Only run migrations and seeding once
if [ ! -f /app/.migrated ]; then
  echo "==> Running migrate and seed..."
  python manage.py migrate --noinput
  python manage.py seed
  touch /app/.migrated
else
  echo "==> Migrations already applied, skipping."
fi

# Start Gunicorn server
exec gunicorn myproj.wsgi:application \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile - \
  --capture-output
