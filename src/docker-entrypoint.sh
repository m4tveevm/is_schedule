#!/bin/sh

echo "Waiting for database..."
until nc -z -v -w30 db 5432; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 3
done

echo "Database is up - running migrations."
python timetable/manage.py migrate
python timetable/manage.py collectstatic --noinput

exec "$@"
