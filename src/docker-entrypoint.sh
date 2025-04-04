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

python manage.py shell <<EOF
import os
from django.contrib.auth import get_user_model

User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(
        username=username,
        email=os.environ.get('DJANGO_SUPERUSER_EMAIL'),
        password=os.environ.get('DJANGO_SUPERUSER_PASSWORD')
    )
EOF
exec "$@"