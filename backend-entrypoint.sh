#!/bin/sh
set -e


echo "Waiting For PostgreSQL at $DJANGO_DB_HOST..."
until pg_isready -h "$DJANGO_DB_HOST" -U "$DJANGO_DB_USER"; do
  sleep 2
done
echo "Postgres is ready"

echo "Generating migrations..."
python manage.py makemigrations --noinput

echo "Applying migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

if [ -n "$DJANGO_SUPERUSER_USERNAME" ]; then
  echo "Creating superuser if needed..."
  python manage.py shell <<'EOF'
import os
from django.contrib.auth import get_user_model
User = get_user_model()
u = os.environ.get('DJANGO_SUPERUSER_USERNAME')
if u and not User.objects.filter(username=u).exists():
    User.objects.create_superuser(
        username=u,
        email=os.environ.get('DJANGO_SUPERUSER_EMAIL',''),
        password=os.environ.get('DJANGO_SUPERUSER_PASSWORD','')
    )
EOF
fi

echo "Starting application..."
exec "$@"

