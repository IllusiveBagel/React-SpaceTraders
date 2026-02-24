import axios from "axios";

const apiBaseUrl =
    process.env.SPACETRADERS_API_BASE_URL || "https://api.spacetraders.io/v2";

const spaceTradersClient = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

/**
 * Execute simple mining action on a ship
 */
const executeMining = async (agentToken, shipSymbol, mineWaypoint) => {
    try {
        // Get ship status first
        const shipRes = await spaceTradersClient.get(
            `/my/ships/${shipSymbol}`,
            {
                headers: {
                    Authorization: `Bearer ${agentToken}`,
                },
            },
        );

        const ship = shipRes.data?.data;
        if (!ship) {
            return { success: false, message: "Ship not found" };
        }

        // If ship is on cooldown, wait
        if (ship.cooldown && new Date(ship.cooldown.expiration) > new Date()) {
            const secondsLeft = Math.ceil(
                (new Date(ship.cooldown.expiration) - new Date()) / 1000,
            );
            return {
                success: false,
                message: `Ship on cooldown for ${secondsLeft}s`,
            };
        }

        // If ship is not at mine waypoint, navigate there
        if (ship.nav.waypointSymbol !== mineWaypoint) {
            const navigateRes = await spaceTradersClient.patch(
                `/my/ships/${shipSymbol}/navigate`,
                { waypointSymbol: mineWaypoint },
                {
                    headers: {
                        Authorization: `Bearer ${agentToken}`,
                    },
                },
            );

            const nav = navigateRes.data?.data?.nav;
            if (nav) {
                const arrivalIn = Math.ceil(
                    (new Date(nav.route.arrival) - new Date()) / 1000,
                );
                return {
                    success: true,
                    message: `Navigating to ${mineWaypoint}, arrival in ${arrivalIn}s`,
                };
            }
        }

        // Extract the ore type from the waypoint symbol if it contains recognized ore
        const oreMap = {
            ASTEROID: "IRON_ORE",
            ICE: "ICE_WATER",
            COPPER: "COPPER_ORE",
            SILICON: "SILICON_CRYSTALS",
            GOLD: "GOLD_ORE",
            PLATINUM: "PLATINUM_ORE",
        };

        let tradeSymbol = "IRON_ORE"; // default
        for (const [key, value] of Object.entries(oreMap)) {
            if (
                mineWaypoint.includes(key) ||
                mineWaypoint.toLowerCase().includes(key.toLowerCase())
            ) {
                tradeSymbol = value;
                break;
            }
        }

        // Mine at the waypoint
        const mineRes = await spaceTradersClient.post(
            `/my/ships/${shipSymbol}/extract`,
            { survey: null },
            {
                headers: {
                    Authorization: `Bearer ${agentToken}`,
                },
            },
        );

        const extraction = mineRes.data?.data?.extraction;
        if (extraction) {
            return {
                success: true,
                message: `Mined ${extraction.yield.quantity}x ${extraction.yield.symbol}`,
            };
        }

        return {
            success: false,
            message: "Mining failed - no extraction data",
        };
    } catch (error) {
        const message =
            error.response?.data?.error?.message ||
            error.message ||
            "Unknown error";
        return { success: false, message: `Mining error: ${message}` };
    }
};

/**
 * Run a single job iteration
 */
export const executeJobIteration = async (store, jobId, agentToken, config) => {
    try {
        // Re-read fresh data
        const data = await store.read();
        const job = data.jobs.find((j) => j.id === jobId);
        const run = data.runs.find((r) => r.jobId === jobId && !r.endedAt);

        if (!job || !run) {
            return;
        }

        const runId = run.id;

        // Based on job mode/template, execute appropriate action
        const mineWaypoint = config.mineWaypoint;
        if (!mineWaypoint) {
            await store.update((d) => {
                d.logs.push({
                    id: `${runId}-log-${Date.now()}`,
                    runId: runId,
                    timestamp: new Date().toISOString(),
                    type: "error",
                    message: "No mine waypoint configured",
                });
                const r = d.runs.find((x) => x.id === runId);
                if (r) {
                    r.updatedAt = new Date().toISOString();
                }
                return d;
            });
            return;
        }

        const result = await executeMining(
            agentToken,
            job.shipSymbol,
            mineWaypoint,
        );

        await store.update((d) => {
            d.logs.push({
                id: `${runId}-log-${Date.now()}`,
                runId: runId,
                timestamp: new Date().toISOString(),
                type: result.success ? "action" : "error",
                message: result.message,
            });
            const r = d.runs.find((x) => x.id === runId);
            if (r) {
                r.updatedAt = new Date().toISOString();
            }
            return d;
        });
    } catch (error) {
        console.error(`Error executing job ${jobId}:`, error.message);
    }
};

/**
 * Start the job executor loop
 */
export const startJobExecutor = (store) => {
    // Run every 10 seconds for testing/demo (can be adjusted to 30000 for production)
    const interval = setInterval(async () => {
        try {
            const data = await store.read();

            // Find all running jobs
            const runningJobs = data.jobs.filter(
                (job) => job.runState === "running",
            );

            if (runningJobs.length > 0) {
                console.log(
                    `[JobExecutor] Found ${runningJobs.length} running job(s)`,
                );
            }

            for (const job of runningJobs) {
                // Get agent token
                const agent = data.agents.find(
                    (a) => a.symbol === job.agentSymbol,
                );
                if (!agent || !agent.token) {
                    console.warn(
                        `[JobExecutor] No agent token for ${job.agentSymbol}`,
                    );
                    continue;
                }

                console.log(
                    `[JobExecutor] Executing job ${job.id} for ship ${job.shipSymbol}`,
                );

                // Execute job iteration
                await executeJobIteration(
                    store,
                    job.id,
                    agent.token,
                    job.config,
                );
            }
        } catch (error) {
            console.error("Job executor error:", error.message);
        }
    }, 10000); // 10 seconds for testing

    console.log("[JobExecutor] Started with 10-second interval");

    // Also return cleanup function
    return () => clearInterval(interval);
};

export default { executeJobIteration, startJobExecutor };
