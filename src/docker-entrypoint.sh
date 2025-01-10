#!/bin/sh
set -e

echo "Checking database connection..."
until python -c "import psycopg2; psycopg2.connect('dbname=$DJANGO_DB_NAME user=$DJANGO_DB_USER password=$DJANGO_DB_PASSWORD host=$DJANGO_DB_HOST')" > /dev/null 2>&1; do
  echo "Waiting for database..."
  sleep 1
done

echo "Running migrations..."
python timetable/manage.py makemigrations
python timetable/manage.py migrate

echo "Collecting static files..."
python timetable/manage.py collectstatic --noinput

exec "$@"