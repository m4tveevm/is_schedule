#!/bin/sh

echo "Waiting for database..."
until pg_isready -h db -U postgres; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 3
done

echo "Database is up - running migrations."
python timetable/manage.py migrate
python timetable/manage.py collectstatic --noinput

exec "$@"