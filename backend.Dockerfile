FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      gcc libpq-dev postgresql-client && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip uv

COPY pyproject.toml uv.lock* /app/

RUN uv pip install --system --no-cache -r pyproject.toml

COPY . /app

COPY backend-entrypoint.sh /backend-entrypoint.sh
RUN chmod +x /backend-entrypoint.sh

ENTRYPOINT ["/backend-entrypoint.sh"]
CMD ["gunicorn", "timetable.wsgi:application", "--bind", "0.0.0.0:8000"]