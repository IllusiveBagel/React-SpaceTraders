import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const DEFAULT_DB = {
    meta: {
        schemaVersion: 3,
        createdAt: new Date().toISOString(),
    },
    cycles: [],
    agents: [],
    stats: [],
    jobs: [],
    runs: [],
    logs: [],
};

const cloneDefaultDb = () => ({
    ...DEFAULT_DB,
    meta: {
        ...DEFAULT_DB.meta,
        createdAt: new Date().toISOString(),
    },
    cycles: [],
    agents: [],
    stats: [],
    jobs: [],
    runs: [],
    logs: [],
});

const parseJson = (raw, fallback) => {
    if (raw === null || raw === undefined) {
        return fallback;
    }

    try {
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
};

class SqliteStore {
    constructor(filePath) {
        this.filePath = filePath;
        this.db = null;
        this.writeQueue = Promise.resolve();
    }

    async init() {
        await mkdir(dirname(this.filePath), { recursive: true });

        this.db = await open({
            filename: this.filePath,
            driver: sqlite3.Database,
        });

        await this.db.exec(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS meta (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS cycles (
                id TEXT PRIMARY KEY,
                started_at TEXT NOT NULL,
                ended_at TEXT,
                reason TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS agents (
                symbol TEXT PRIMARY KEY,
                token TEXT NOT NULL,
                faction TEXT,
                headquarters TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS stats (
                agent_symbol TEXT NOT NULL,
                cycle_id TEXT NOT NULL,
                snapshots_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                PRIMARY KEY (agent_symbol, cycle_id)
            );
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                agent_symbol TEXT NOT NULL,
                ship_symbol TEXT NOT NULL,
                mode TEXT NOT NULL,
                template_id TEXT,
                config_json TEXT,
                run_state TEXT NOT NULL,
                last_run_id TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS runs (
                id TEXT PRIMARY KEY,
                job_id TEXT NOT NULL,
                status TEXT NOT NULL,
                started_at TEXT NOT NULL,
                ended_at TEXT,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS logs (
                id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                type TEXT NOT NULL,
                message TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_jobs_agent_symbol ON jobs(agent_symbol);
            CREATE INDEX IF NOT EXISTS idx_runs_job_id ON runs(job_id);
            CREATE INDEX IF NOT EXISTS idx_logs_run_id_timestamp ON logs(run_id, timestamp);
        `);

        const hasMeta = await this.db.get(
            "SELECT 1 AS ok FROM meta WHERE key = 'schemaVersion'",
        );

        if (!hasMeta) {
            const now = new Date().toISOString();
            await this.db.run(
                "INSERT INTO meta (key, value) VALUES ('schemaVersion', ?)",
                String(DEFAULT_DB.meta.schemaVersion),
            );
            await this.db.run(
                "INSERT INTO meta (key, value) VALUES ('createdAt', ?)",
                now,
            );
        }

        await this.ensureActiveCycle();
    }

    async read() {
        const data = await this.readFromDatabase();
        return this.ensureShape(data);
    }

    async write(data) {
        const nextData = this.ensureShape(data);

        this.writeQueue = this.writeQueue.then(() =>
            this.writeToDatabase(nextData),
        );

        await this.writeQueue;
    }

    async update(updater) {
        const current = await this.read();
        const next = updater(structuredClone(current));
        await this.write(next);
        return next;
    }

    ensureShape(data) {
        const stats = (Array.isArray(data?.stats) ? data.stats : []).map(
            (entry) => ({
                ...entry,
                snapshots: Array.isArray(entry?.snapshots)
                    ? entry.snapshots.slice(-1000)
                    : [],
            }),
        );

        return {
            meta: {
                schemaVersion:
                    typeof data?.meta?.schemaVersion === "number"
                        ? data.meta.schemaVersion
                        : DEFAULT_DB.meta.schemaVersion,
                createdAt:
                    typeof data?.meta?.createdAt === "string"
                        ? data.meta.createdAt
                        : new Date().toISOString(),
            },
            cycles: Array.isArray(data?.cycles) ? data.cycles : [],
            agents: Array.isArray(data?.agents) ? data.agents : [],
            stats,
            jobs: Array.isArray(data?.jobs) ? data.jobs : [],
            runs: Array.isArray(data?.runs) ? data.runs : [],
            logs: Array.isArray(data?.logs) ? data.logs.slice(-5000) : [],
        };
    }

    async readFromDatabase() {
        const [metaRows, cycles, agents, statsRows, jobsRows, runs, logs] =
            await Promise.all([
                this.db.all("SELECT key, value FROM meta"),
                this.db.all(
                    "SELECT id, started_at, ended_at, reason FROM cycles ORDER BY started_at ASC",
                ),
                this.db.all(
                    "SELECT symbol, token, faction, headquarters, created_at, updated_at FROM agents ORDER BY updated_at DESC",
                ),
                this.db.all(
                    "SELECT agent_symbol, cycle_id, snapshots_json, created_at, updated_at FROM stats",
                ),
                this.db.all(
                    "SELECT id, agent_symbol, ship_symbol, mode, template_id, config_json, run_state, last_run_id, created_at, updated_at FROM jobs",
                ),
                this.db.all(
                    "SELECT id, job_id, status, started_at, ended_at, updated_at FROM runs",
                ),
                this.db.all(
                    "SELECT id, run_id, timestamp, type, message FROM logs ORDER BY timestamp ASC",
                ),
            ]);

        const meta = metaRows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});

        return {
            meta: {
                schemaVersion:
                    Number(meta.schemaVersion) || DEFAULT_DB.meta.schemaVersion,
                createdAt:
                    typeof meta.createdAt === "string"
                        ? meta.createdAt
                        : new Date().toISOString(),
            },
            cycles: cycles.map((row) => ({
                id: row.id,
                startedAt: row.started_at,
                endedAt: row.ended_at,
                reason: row.reason,
            })),
            agents: agents.map((row) => ({
                symbol: row.symbol,
                token: row.token,
                faction: row.faction,
                headquarters: row.headquarters,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            })),
            stats: statsRows.map((row) => ({
                agentSymbol: row.agent_symbol,
                cycleId: row.cycle_id,
                snapshots: parseJson(row.snapshots_json, []),
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            })),
            jobs: jobsRows.map((row) => ({
                id: row.id,
                agentSymbol: row.agent_symbol,
                shipSymbol: row.ship_symbol,
                mode: row.mode,
                templateId: row.template_id,
                config: parseJson(row.config_json, undefined),
                runState: row.run_state,
                lastRunId: row.last_run_id,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            })),
            runs: runs.map((row) => ({
                id: row.id,
                jobId: row.job_id,
                status: row.status,
                startedAt: row.started_at,
                endedAt: row.ended_at,
                updatedAt: row.updated_at,
            })),
            logs: logs.map((row) => ({
                id: row.id,
                runId: row.run_id,
                timestamp: row.timestamp,
                type: row.type,
                message: row.message,
            })),
        };
    }

    async writeToDatabase(data) {
        await this.db.exec("BEGIN IMMEDIATE TRANSACTION");

        try {
            await this.db.exec("DELETE FROM cycles");
            await this.db.exec("DELETE FROM agents");
            await this.db.exec("DELETE FROM stats");
            await this.db.exec("DELETE FROM jobs");
            await this.db.exec("DELETE FROM runs");
            await this.db.exec("DELETE FROM logs");

            await this.db.exec("DELETE FROM meta");
            await this.db.run(
                "INSERT INTO meta (key, value) VALUES ('schemaVersion', ?)",
                String(data.meta.schemaVersion),
            );
            await this.db.run(
                "INSERT INTO meta (key, value) VALUES ('createdAt', ?)",
                data.meta.createdAt,
            );

            for (const cycle of data.cycles) {
                await this.db.run(
                    "INSERT INTO cycles (id, started_at, ended_at, reason) VALUES (?, ?, ?, ?)",
                    cycle.id,
                    cycle.startedAt,
                    cycle.endedAt,
                    cycle.reason,
                );
            }

            for (const agent of data.agents) {
                await this.db.run(
                    "INSERT INTO agents (symbol, token, faction, headquarters, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                    agent.symbol,
                    agent.token,
                    agent.faction ?? null,
                    agent.headquarters ?? null,
                    agent.createdAt,
                    agent.updatedAt,
                );
            }

            for (const stat of data.stats) {
                await this.db.run(
                    "INSERT INTO stats (agent_symbol, cycle_id, snapshots_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
                    stat.agentSymbol,
                    stat.cycleId,
                    JSON.stringify(stat.snapshots ?? []),
                    stat.createdAt,
                    stat.updatedAt,
                );
            }

            for (const job of data.jobs) {
                await this.db.run(
                    "INSERT INTO jobs (id, agent_symbol, ship_symbol, mode, template_id, config_json, run_state, last_run_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    job.id,
                    job.agentSymbol,
                    job.shipSymbol,
                    job.mode,
                    job.templateId ?? null,
                    job.config === undefined
                        ? null
                        : JSON.stringify(job.config),
                    job.runState,
                    job.lastRunId ?? null,
                    job.createdAt,
                    job.updatedAt,
                );
            }

            for (const run of data.runs) {
                await this.db.run(
                    "INSERT INTO runs (id, job_id, status, started_at, ended_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                    run.id,
                    run.jobId,
                    run.status,
                    run.startedAt,
                    run.endedAt,
                    run.updatedAt,
                );
            }

            for (const log of data.logs) {
                await this.db.run(
                    "INSERT INTO logs (id, run_id, timestamp, type, message) VALUES (?, ?, ?, ?, ?)",
                    log.id,
                    log.runId,
                    log.timestamp,
                    log.type,
                    log.message,
                );
            }

            await this.db.exec("COMMIT");
        } catch (error) {
            await this.db.exec("ROLLBACK");
            throw error;
        }
    }

    getCurrentCycle(data) {
        const activeCycle = data.cycles.find((cycle) => !cycle.endedAt);
        if (activeCycle) {
            return activeCycle;
        }

        return null;
    }

    async ensureActiveCycle() {
        return this.update((data) => {
            const currentCycle = this.getCurrentCycle(data);

            if (currentCycle) {
                return data;
            }

            data.cycles.push({
                id: randomUUID(),
                startedAt: new Date().toISOString(),
                endedAt: null,
                reason: "initial",
            });

            return data;
        });
    }
}

export { SqliteStore };
