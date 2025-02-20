#!/bin/sh
set -e

echo "Waiting for database at $DJANGO_DB_HOST..."
until pg_isready -h "$DJANGO_DB_HOST" -U "$DJANGO_DB_USER"; do
  echo "Waiting for PostgreSQL..."
  sleep 3
done

echo "Database is up - running migrations."
python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec "$@"
