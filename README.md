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

## Database schema and seed data

The Prisma schema is in `backend/prisma/schema.prisma`. Create a development migration and generate the client inside the backend container:

```bash
docker compose exec backend prisma migrate dev --name init_core_models
docker compose exec backend prisma generate
docker compose exec backend python prisma/seed.py
```

The seed script is idempotent and creates Chicken Tehari, Beef Kacchi, Paratha, Pastry, and starter ingredients.

## Stop the stack

```bash
docker compose down
```

Use `docker compose down -v` only when you intentionally want to remove the local PostgreSQL data volume.
