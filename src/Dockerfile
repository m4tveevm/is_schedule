FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      curl postgresql-client gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements/prod.txt /app/requirements/prod.txt
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements/prod.txt

COPY . /app

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]

CMD ["gunicorn", "timetable.wsgi:application", "--bind", "0.0.0.0:8000"]
