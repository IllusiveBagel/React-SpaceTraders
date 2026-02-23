# Roadmap

## Phase 1 - Auth and onboarding (highest priority)

- In-app token acquisition flow (no manual env edits).
- Simple "Connect your account" screen with copy-paste fallback.
- Store token securely (local storage or similar) and provide sign-out.
- First-run onboarding: status check, fetch agent, verify token, success screen.
- Clear error handling for invalid token, rate limits, and API downtime.

### User flow (account token in env)

- Entry: user opens the app and lands on a "Select agent" screen.
- Step 1: user can paste an existing agent token to connect.
- Step 2: or user creates a new agent (callsign + faction) using the account token.
- Step 3: on success, app stores the agent token and proceeds to Home.
- Exit: user can switch agents from settings; account token stays in env.

### Minimal implementation checklist

- Add an env config for the account token and validate it on app load.
- Add a "Select agent" route/page that loads before the main app.
- Add API call to register an agent and return the agent token.
- Add paste-token flow to connect to an existing agent.
- Store selected agent token locally and use it for all authenticated calls.
- Add route gating so the app requires a selected agent.
- Add settings UI to switch agents (re-run selection flow).

### Progress

- Added account token env config (`VITE_ACCOUNT_TOKEN`).
- Added Select Agent page with create + paste token flows.
- Added agent token storage and route gating.
- Added switch agent action in the sidebar.

## Phase 2 - Mission Control / Home upgrade

- Home becomes an operations dashboard.
- Real-time fleet status (in transit/docked/orbit), cooldowns, and alerts.
- Active contracts progress and deadline visibility.
- Credits trend and profit-per-hour estimate.
- Quick actions (refuel, accept contract, navigate to market/shipyard).

### User flow

- Entry: user lands on Home and sees a mission control overview.
- Step 1: top summary shows credits, fleet status, and key alerts.
- Step 2: contracts panel highlights active deadlines and progress.
- Step 3: fleet panel shows ships in transit, cooldowns, and next actions.
- Step 4: quick actions allow fast navigation and common actions.
- Exit: user clicks into Ship, Market, Shipyard, or Contract details.

### Minimal implementation checklist

- Add a Mission Control layout to Home with clear sections.
- Add data cards for credits, ships by status, and cooldown counts.
- Add contracts panel with progress + time remaining.
- Add alerts panel for low fuel, cooldown done, and expiring contracts.
- Add quick action buttons for refuel, accept, and navigate.
- Add lightweight refresh cadence for critical panels.

## Phase 3 - Automation expansion

- Strategy templates (mining loop, trade loop, contract fulfillment).
- Run logs with triggers and outcomes.
- Safety rails: pause on errors, cooldown handling, fuel thresholds.

### User flow

- Entry: user opens Automation and sees available strategy templates.
- Step 1: user selects a template and configures parameters (waypoints, cargo, limits).
- Step 2: user starts the strategy and sees live run status.
- Step 3: automation shows step-by-step actions with outcomes and errors.
- Step 4: user pauses or stops the run, then reviews the run log.
- Exit: user can clone a strategy with tweaks for another ship.

### Minimal implementation checklist

- Define strategy template models and default configs.
- Add UI to configure and launch a strategy per ship.
- Add run state tracking (running, paused, stopped, error).
- Add a run log view with timestamps and outcomes.
- Add safety checks (fuel threshold, cargo capacity, cooldown ready).
- Add retry/timeout behavior and error surfaces.

## Phase 4 - Background automation service (backend)

- Backend scheduler to run automation when the UI is closed.
- Job queue and persistence for long-running tasks.
- Secure token storage in backend with audit logs.
- Notifications (webhook/email/discord) for completion or failures.

### User flow

- Entry: user enables background automation in settings.
- Step 1: user connects backend and grants token access.
- Step 2: user selects a strategy and schedules or runs immediately.
- Step 3: backend runs jobs and streams status to the UI.
- Step 4: user receives notifications for key events or failures.
- Exit: user can stop jobs and revoke backend access at any time.

### Minimal implementation checklist

- Define backend service scope and API contract (auth, jobs, logs).
- Implement secure token storage and encryption at rest.
- Add job scheduler + persistence (queue + retries).
- Add endpoints for start/stop/pause and job status streaming.
- Add notification hooks (webhook/discord/email) and preferences.
