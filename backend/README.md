# Backend service

This backend is intentionally lightweight for local/self-hosted usage.

## Responsibilities

- Store agent tokens by symbol
- Return stored agents for selection in frontend
- Return token for selected agent
- Persist mission-control stats snapshots per agent and cycle
- Handle manual reset cycles
- Persist automation jobs, run state, and run logs (phase 4 first slice)

## Environment variables

- `PORT` (default `3000`)
- `SQLITE_PATH` (default `./data/db.sqlite` for local dev)
- `DB_FILE` (legacy alias for `SQLITE_PATH`)
- `DATA_FILE` (legacy alias for `SQLITE_PATH`)
- `SPACETRADERS_API_BASE_URL` (default `https://api.spacetraders.io/v2`)

## Run

```bash
npm install
npm run dev
```

## Data model (SQLite database)

- `cycles[]`: active/closed game cycles
- `agents[]`: stored tokens and metadata
- `stats[]`: per-agent, per-cycle snapshots
- `jobs[]`: automation job definitions and run state
- `runs[]`: execution run lifecycle records
- `logs[]`: run event logs

## Job/run endpoints (phase 4 first slice)

- `GET /jobs`
- `GET /jobs/:id`
- `POST /jobs`
- `POST /jobs/:id/start`
- `POST /jobs/:id/pause`
- `POST /jobs/:id/stop`
- `GET /runs/:id`
- `GET /runs/:id/logs`
