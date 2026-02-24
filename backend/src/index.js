import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";

import { SqliteStore } from "./store.js";
import { validateAgentToken } from "./spacetraders.js";
import { startJobExecutor } from "./jobExecutor.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const sqlitePath =
    process.env.SQLITE_PATH ||
    process.env.DB_FILE ||
    process.env.DATA_FILE ||
    "./data/db.sqlite";

const store = new SqliteStore(sqlitePath);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const getCurrentCycle = (data) => {
    const current = data.cycles.find((cycle) => !cycle.endedAt);

    if (current) {
        return current;
    }

    const fallback = {
        id: randomUUID(),
        startedAt: new Date().toISOString(),
        endedAt: null,
        reason: "fallback",
    };

    data.cycles.push(fallback);
    return fallback;
};

const formatAgent = (agent) => ({
    symbol: agent.symbol,
    faction: agent.faction,
    headquarters: agent.headquarters,
    hasToken: true,
    updatedAt: agent.updatedAt,
});

const formatJob = (job) => ({
    id: job.id,
    agentSymbol: job.agentSymbol,
    shipSymbol: job.shipSymbol,
    mode: job.mode,
    templateId: job.templateId,
    config: job.config,
    runState: job.runState,
    lastRunId: job.lastRunId,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
});

const formatRun = (run) => ({
    id: run.id,
    jobId: run.jobId,
    status: run.status,
    startedAt: run.startedAt,
    endedAt: run.endedAt,
    updatedAt: run.updatedAt,
});

const appendRunLog = (data, runId, message, type = "system") => {
    data.logs.push({
        id: randomUUID(),
        runId,
        timestamp: new Date().toISOString(),
        type,
        message,
    });

    if (data.logs.length > 5000) {
        data.logs = data.logs.slice(-5000);
    }
};

app.get("/health", async (_req, res) => {
    const data = await store.read();
    const cycle = getCurrentCycle(data);

    return res.json({
        data: {
            ok: true,
            activeCycleId: cycle.id,
            agentCount: data.agents.length,
        },
    });
});

app.get("/cycles/current", async (_req, res) => {
    const data = await store.read();
    const cycle = getCurrentCycle(data);

    return res.json({ data: cycle });
});

app.post("/cycles/reset", async (req, res) => {
    const reason =
        typeof req.body?.reason === "string" && req.body.reason.trim()
            ? req.body.reason.trim()
            : "manual";

    const now = new Date().toISOString();

    const next = await store.update((data) => {
        const current = getCurrentCycle(data);
        current.endedAt = now;

        const newCycle = {
            id: randomUUID(),
            startedAt: now,
            endedAt: null,
            reason,
        };

        data.cycles.push(newCycle);
        return data;
    });

    const activeCycle = getCurrentCycle(next);

    return res.status(201).json({
        data: {
            activeCycle,
            reason,
        },
    });
});

app.get("/agents", async (_req, res) => {
    const data = await store.read();

    return res.json({
        data: {
            agents: data.agents
                .slice()
                .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
                .map(formatAgent),
        },
    });
});

app.post("/agents", async (req, res) => {
    const token =
        typeof req.body?.token === "string" ? req.body.token.trim() : "";

    if (!token) {
        return res.status(400).json({
            error: { message: "Agent token is required." },
        });
    }

    let agentInfo;
    try {
        agentInfo = await validateAgentToken(token);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Invalid agent token.";

        return res.status(400).json({
            error: { message },
        });
    }

    const now = new Date().toISOString();

    const next = await store.update((data) => {
        const existing = data.agents.find(
            (agent) => agent.symbol === agentInfo.symbol,
        );

        if (existing) {
            existing.token = token;
            existing.faction = agentInfo.startingFaction;
            existing.headquarters = agentInfo.headquarters;
            existing.updatedAt = now;
            return data;
        }

        data.agents.push({
            symbol: agentInfo.symbol,
            token,
            faction: agentInfo.startingFaction,
            headquarters: agentInfo.headquarters,
            createdAt: now,
            updatedAt: now,
        });

        return data;
    });

    const savedAgent = next.agents.find(
        (agent) => agent.symbol === agentInfo.symbol,
    );

    return res.status(201).json({
        data: formatAgent(savedAgent),
    });
});

app.post("/agents/select", async (req, res) => {
    const symbol =
        typeof req.body?.symbol === "string"
            ? req.body.symbol.trim().toUpperCase()
            : "";

    if (!symbol) {
        return res.status(400).json({
            error: { message: "Agent symbol is required." },
        });
    }

    const data = await store.read();
    const agent = data.agents.find((entry) => entry.symbol === symbol);

    if (!agent) {
        return res.status(404).json({
            error: { message: `No stored agent found for ${symbol}.` },
        });
    }

    return res.json({
        data: {
            symbol: agent.symbol,
            token: agent.token,
        },
    });
});

app.delete("/agents/:symbol", async (req, res) => {
    const symbol = req.params.symbol.trim().toUpperCase();

    await store.update((data) => {
        data.agents = data.agents.filter((agent) => agent.symbol !== symbol);
        data.stats = data.stats.filter((stat) => stat.agentSymbol !== symbol);
        return data;
    });

    return res.status(204).send();
});

app.get("/jobs", async (req, res) => {
    const data = await store.read();
    const agentSymbol =
        typeof req.query.agentSymbol === "string"
            ? req.query.agentSymbol.trim().toUpperCase()
            : "";

    const jobs = data.jobs
        .filter((job) => (agentSymbol ? job.agentSymbol === agentSymbol : true))
        .slice()
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map(formatJob);

    return res.json({ data: { jobs } });
});

app.get("/jobs/:id", async (req, res) => {
    const id = req.params.id.trim();
    const data = await store.read();
    const job = data.jobs.find((entry) => entry.id === id);

    if (!job) {
        return res.status(404).json({
            error: { message: `No job found for ${id}.` },
        });
    }

    return res.json({ data: formatJob(job) });
});

app.post("/jobs", async (req, res) => {
    const agentSymbol =
        typeof req.body?.agentSymbol === "string"
            ? req.body.agentSymbol.trim().toUpperCase()
            : "";
    const shipSymbol =
        typeof req.body?.shipSymbol === "string"
            ? req.body.shipSymbol.trim().toUpperCase()
            : "";
    const mode = typeof req.body?.mode === "string" ? req.body.mode.trim() : "";
    const templateId =
        typeof req.body?.templateId === "string"
            ? req.body.templateId.trim()
            : undefined;
    const config =
        req.body?.config && typeof req.body.config === "object"
            ? req.body.config
            : undefined;

    if (!agentSymbol) {
        return res.status(400).json({
            error: { message: "Agent symbol is required." },
        });
    }

    if (!shipSymbol) {
        return res.status(400).json({
            error: { message: "Ship symbol is required." },
        });
    }

    if (!mode) {
        return res.status(400).json({
            error: { message: "Automation mode is required." },
        });
    }

    const now = new Date().toISOString();
    const next = await store.update((data) => {
        const existing = data.jobs.find(
            (job) =>
                job.agentSymbol === agentSymbol &&
                job.shipSymbol === shipSymbol &&
                job.mode === mode,
        );

        if (existing) {
            existing.templateId = templateId;
            existing.config = config;
            existing.updatedAt = now;
            return data;
        }

        data.jobs.push({
            id: randomUUID(),
            agentSymbol,
            shipSymbol,
            mode,
            templateId,
            config,
            runState: "stopped",
            lastRunId: null,
            createdAt: now,
            updatedAt: now,
        });

        return data;
    });

    const saved = next.jobs
        .filter(
            (job) =>
                job.agentSymbol === agentSymbol &&
                job.shipSymbol === shipSymbol &&
                job.mode === mode,
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

    return res.status(201).json({ data: formatJob(saved) });
});

app.post("/jobs/:id/start", async (req, res) => {
    const id = req.params.id.trim();
    const now = new Date().toISOString();

    const next = await store.update((data) => {
        const job = data.jobs.find((entry) => entry.id === id);
        if (!job) {
            return data;
        }

        const activeRun = data.runs.find(
            (entry) => entry.jobId === id && entry.endedAt === null,
        );
        if (activeRun && activeRun.status === "running") {
            return data;
        }

        const run = {
            id: randomUUID(),
            jobId: id,
            status: "running",
            startedAt: now,
            endedAt: null,
            updatedAt: now,
        };

        data.runs.push(run);
        job.runState = "running";
        job.lastRunId = run.id;
        job.updatedAt = now;
        appendRunLog(data, run.id, "Run started");

        return data;
    });

    const job = next.jobs.find((entry) => entry.id === id);
    if (!job) {
        return res.status(404).json({
            error: { message: `No job found for ${id}.` },
        });
    }

    const run = next.runs.find((entry) => entry.id === job.lastRunId);

    return res.status(201).json({
        data: {
            job: formatJob(job),
            run: run ? formatRun(run) : null,
        },
    });
});

app.post("/jobs/:id/pause", async (req, res) => {
    const id = req.params.id.trim();
    const now = new Date().toISOString();

    const next = await store.update((data) => {
        const job = data.jobs.find((entry) => entry.id === id);
        if (!job) {
            return data;
        }

        const activeRun = data.runs.find(
            (entry) => entry.jobId === id && entry.endedAt === null,
        );
        if (!activeRun) {
            return data;
        }

        activeRun.status = "paused";
        activeRun.updatedAt = now;
        job.runState = "paused";
        job.updatedAt = now;
        appendRunLog(data, activeRun.id, "Run paused");

        return data;
    });

    const job = next.jobs.find((entry) => entry.id === id);
    if (!job) {
        return res.status(404).json({
            error: { message: `No job found for ${id}.` },
        });
    }

    const run = next.runs.find((entry) => entry.id === job.lastRunId);

    return res.json({
        data: {
            job: formatJob(job),
            run: run ? formatRun(run) : null,
        },
    });
});

app.post("/jobs/:id/stop", async (req, res) => {
    const id = req.params.id.trim();
    const now = new Date().toISOString();

    const next = await store.update((data) => {
        const job = data.jobs.find((entry) => entry.id === id);
        if (!job) {
            return data;
        }

        const activeRun = data.runs.find(
            (entry) => entry.jobId === id && entry.endedAt === null,
        );
        if (activeRun) {
            activeRun.status = "stopped";
            activeRun.endedAt = now;
            activeRun.updatedAt = now;
            appendRunLog(data, activeRun.id, "Run stopped");
        }

        job.runState = "stopped";
        job.updatedAt = now;

        return data;
    });

    const job = next.jobs.find((entry) => entry.id === id);
    if (!job) {
        return res.status(404).json({
            error: { message: `No job found for ${id}.` },
        });
    }

    const run = next.runs.find((entry) => entry.id === job.lastRunId);

    return res.json({
        data: {
            job: formatJob(job),
            run: run ? formatRun(run) : null,
        },
    });
});

app.get("/runs/:id", async (req, res) => {
    const id = req.params.id.trim();
    const data = await store.read();
    const run = data.runs.find((entry) => entry.id === id);

    if (!run) {
        return res.status(404).json({
            error: { message: `No run found for ${id}.` },
        });
    }

    return res.json({ data: formatRun(run) });
});

app.get("/runs/:id/logs", async (req, res) => {
    const id = req.params.id.trim();
    const data = await store.read();
    const run = data.runs.find((entry) => entry.id === id);

    if (!run) {
        return res.status(404).json({
            error: { message: `No run found for ${id}.` },
        });
    }

    const logs = data.logs
        .filter((entry) => entry.runId === id)
        .slice()
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return res.json({
        data: {
            runId: id,
            logs,
        },
    });
});

app.get("/stats/:symbol", async (req, res) => {
    const symbol = req.params.symbol.trim().toUpperCase();
    const data = await store.read();

    const currentCycle = getCurrentCycle(data);
    const cycleIdParam =
        typeof req.query.cycleId === "string" ? req.query.cycleId : undefined;
    const cycleId = cycleIdParam || currentCycle.id;

    const stats = data.stats.find(
        (entry) => entry.agentSymbol === symbol && entry.cycleId === cycleId,
    );

    return res.json({
        data: {
            agentSymbol: symbol,
            cycleId,
            snapshots: stats?.snapshots ?? [],
        },
    });
});

app.post("/stats/:symbol/snapshots", async (req, res) => {
    const symbol = req.params.symbol.trim().toUpperCase();

    const payload = {
        credits:
            typeof req.body?.credits === "number"
                ? req.body.credits
                : undefined,
        shipCount:
            typeof req.body?.shipCount === "number"
                ? req.body.shipCount
                : undefined,
        contractsOpen:
            typeof req.body?.contractsOpen === "number"
                ? req.body.contractsOpen
                : undefined,
        contractsFulfilled:
            typeof req.body?.contractsFulfilled === "number"
                ? req.body.contractsFulfilled
                : undefined,
        custom:
            req.body?.custom && typeof req.body.custom === "object"
                ? req.body.custom
                : undefined,
    };

    const hasAnyData =
        payload.credits !== undefined ||
        payload.shipCount !== undefined ||
        payload.contractsOpen !== undefined ||
        payload.contractsFulfilled !== undefined ||
        payload.custom !== undefined;

    if (!hasAnyData) {
        return res.status(400).json({
            error: { message: "At least one stats field is required." },
        });
    }

    const now = new Date().toISOString();

    const next = await store.update((data) => {
        const cycle = getCurrentCycle(data);
        const existing = data.stats.find(
            (entry) =>
                entry.agentSymbol === symbol && entry.cycleId === cycle.id,
        );

        const snapshot = {
            timestamp: now,
            ...payload,
        };

        if (existing) {
            existing.snapshots.push(snapshot);
            existing.updatedAt = now;

            if (existing.snapshots.length > 1000) {
                existing.snapshots = existing.snapshots.slice(-1000);
            }

            return data;
        }

        data.stats.push({
            agentSymbol: symbol,
            cycleId: cycle.id,
            snapshots: [snapshot],
            createdAt: now,
            updatedAt: now,
        });

        return data;
    });

    const cycle = getCurrentCycle(next);
    const stat = next.stats.find(
        (entry) => entry.agentSymbol === symbol && entry.cycleId === cycle.id,
    );

    return res.status(201).json({
        data: {
            agentSymbol: symbol,
            cycleId: cycle.id,
            snapshotCount: stat?.snapshots.length ?? 0,
        },
    });
});

app.use((error, _req, res, _next) => {
    const message =
        error instanceof Error ? error.message : "Internal server error.";
    return res.status(500).json({ error: { message } });
});

const start = async () => {
    await store.init();

    // Start job executor
    startJobExecutor(store);

    app.listen(port, () => {
        console.log(`Backend listening on port ${port}`);
    });
};

start().catch((error) => {
    console.error("Failed to start backend", error);
    process.exit(1);
});
