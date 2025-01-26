#!/bin/sh
set -e

echo "Checking database connection..."

TIMEOUT=30
while [ ! -f /run/secrets/pg_password ] && [ "$TIMEOUT" -gt 0 ]; do
  echo "Waiting for /run/secrets/pg_password to be available..."
  sleep 1
  TIMEOUT=$((TIMEOUT - 1))
done

if [ ! -f /run/secrets/pg_password ]; then
  echo "ERROR: Secret /run/secrets/pg_password not found after 30 seconds. Exiting."
  exit 1
fi

export DJANGO_DB_PASSWORD=$(cat /run/secrets/pg_password)

TIMEOUT=30
until python -c "
import psycopg2
import sys
try:
    psycopg2.connect('dbname=$DJANGO_DB_NAME user=$DJANGO_DB_USER password=$DJANGO_DB_PASSWORD host=$DJANGO_DB_HOST')
    sys.exit(0)
except Exception:
    sys.exit(1)
" > /dev/null 2>&1 || [ "$TIMEOUT" -le 0 ]; do
  echo "Waiting for database..."
  sleep 1
  TIMEOUT=$((TIMEOUT - 1))
done

if [ "$TIMEOUT" -le 0 ]; then
  echo "ERROR: Database connection failed after 30 seconds. Exiting."
  exit 1
fi

echo "Database is ready. Starting Django..."
exec "$@"
