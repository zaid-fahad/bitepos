# BiteOS

BiteOS is a portrait-first restaurant POS for small food vendors in Bangladesh. This repository contains the React PWA frontend, FastAPI backend, and PostgreSQL database used by the product.

## Prerequisites

- Docker Desktop with Docker Compose

## Start the local stack

```bash
cp .env.example .env
docker compose up --build
```

The services are then available at:

- Frontend: http://localhost:5173
- Backend health check: http://localhost:8000/health
- PostgreSQL: `localhost:5432`

The health endpoint returns:

```json
{"status":"ok"}
```

## Database schema

The initial Prisma schema is in `backend/prisma/schema.prisma`. Once migrations are introduced, run Prisma commands inside the backend container, for example:

```bash
docker compose exec backend prisma generate
```

## Stop the stack

```bash
docker compose down
```

Use `docker compose down -v` only when you intentionally want to remove the local PostgreSQL data volume.

