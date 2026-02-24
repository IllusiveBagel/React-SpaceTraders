# React SpaceTraders

Frontend (React + Vite) with an in-repo backend service for agent token custody,
agent selection, mission-control stats persistence, and manual reset cycles.

## Project layout

- `client/`: frontend app (React + Vite)
- `backend/`: backend API service (Express)
- `docker-compose.yml`: runs frontend + backend together
- `package.json` (root): workspace scripts for running both apps together

## Install dependencies (workspace root)

```bash
npm install
```

## Run both locally (root)

```bash
npm run dev
```

This starts:

- backend dev server via workspace `backend`
- client dev server via workspace `client`

## Run only one app

```bash
npm run dev:client
npm run dev:backend
```

## Run client directly

```bash
cd client
npm install
npm run dev
```

## Run backend directly

```bash
cd backend
npm install
npm run dev
```

Backend defaults:

- Port: `3000`
- SQLite DB file: `./data/db.sqlite` for local dev (override with `SQLITE_PATH`)
- SpaceTraders base URL: `https://api.spacetraders.io/v2`

## Run both with Docker Compose

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:8080`
- Backend direct: `http://localhost:3000`
- Backend via frontend proxy: `http://localhost:8080/backend`

The frontend container injects:

- `VITE_API_BASE_URL=https://api.spacetraders.io/v2`
- `VITE_BACKEND_BASE_URL=/backend`

## Build and publish Docker images

From the repo root:

```bash
npm run docker:build
npm run docker:publish
```

Or do both in one command:

```bash
npm run docker:release
```

Optional environment variables:

- `DOCKER_NAMESPACE` (default: `react-spacetraders`)
- `IMAGE_TAG` (default: `latest`)

Example:

```bash
DOCKER_NAMESPACE=ghcr.io/your-org IMAGE_TAG=2026-02-24 npm run docker:release
```

## Backend API (MVP)

- `GET /health`
- `GET /cycles/current`
- `POST /cycles/reset`
- `GET /agents`
- `POST /agents` (body: `{ "token": "..." }`)
- `POST /agents/select` (body: `{ "symbol": "..." }`)
- `DELETE /agents/:symbol`
- `GET /stats/:symbol?cycleId=...`
- `POST /stats/:symbol/snapshots`

Stats snapshots are partitioned by `agentSymbol` + active reset cycle.
