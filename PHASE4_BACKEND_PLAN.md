# Phase 4 Backend Plan

## Goal

Run automation jobs while the UI is closed, keep logs and status in sync, and provide secure token handling plus notifications.

## Current implementation status (23 Feb 2026)

- Backend scaffold now lives in-repo at `backend/`.
- Docker Compose now runs frontend + backend together.
- Current backend MVP includes:
    - agent token storage and selection
    - manual reset cycles
    - per-agent/per-cycle stats snapshots

## Recommended stack

- API: Node.js + TypeScript (Fastify or Express)
- Queue: BullMQ (Redis) or pg-boss (PostgreSQL)
- Persistence: PostgreSQL (jobs, runs, logs, settings)
- Realtime: WebSocket or Server-Sent Events (SSE)
- Auth: session token for UI; encrypted storage for agent tokens
- Notifications: webhook + Discord first, email later

## Core data model

- accounts: user identity, API key for backend access
- agents: agent metadata + encrypted agent token + selected config
- automation_jobs: job definition (strategy, params, ship symbol, schedule)
- automation_runs: execution record (status, timestamps, result)
- automation_logs: step events (message, action, duration, result)
- notification_settings: webhook/discord/email + filters

## API surface (minimum viable)

- POST /auth/connect: exchange backend key, return session token
- GET /agents: list agents connected to backend
- POST /agents: register agent (store token securely)
- POST /jobs: create automation job
- GET /jobs: list jobs
- POST /jobs/:id/start: start run
- POST /jobs/:id/pause: pause run
- POST /jobs/:id/stop: stop run
- GET /runs/:id: get run status
- GET /runs/:id/logs: fetch logs
- GET /stream/runs/:id: live updates (SSE/WebSocket)

## API surface (implemented first slice)

- GET /health
- GET /cycles/current
- POST /cycles/reset
- GET /agents
- POST /agents
- POST /agents/select
- DELETE /agents/:symbol
- GET /stats/:symbol
- POST /stats/:symbol/snapshots
- GET /jobs
- GET /jobs/:id
- POST /jobs
- POST /jobs/:id/start
- POST /jobs/:id/pause
- POST /jobs/:id/stop
- GET /runs/:id
- GET /runs/:id/logs

## Scheduler and execution

- Job runner executes the same logic as automationEngine (shared when possible)
- Retry with exponential backoff and max attempts
- Persist every step to automation_logs
- Emit events over SSE/WebSocket for UI updates

## Security

- Encrypt tokens at rest (KMS or server-side AES with rotation)
- Backend API uses a service-level key or JWT
- Audit log for token access and job actions
- Rate limit endpoints and queue concurrency

## Frontend integration points

- Add Background automation settings page
    - Connect backend (API base + key)
    - Register agent token with backend
    - Show running jobs + logs
- Switch Automation UI to run locally or run in backend
- Show job status using SSE/WebSocket

## Incremental rollout

1. Stand up backend with /agents, /jobs, /runs, /logs
2. Implement scheduler + run state
3. Add logs + SSE
4. Add notifications
