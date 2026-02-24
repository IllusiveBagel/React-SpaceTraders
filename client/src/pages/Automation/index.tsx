import { useEffect } from "react";

import useGetShips from "hooks/fleet/useGetShips";
import useGetAgent from "hooks/agent/useGetAgent";
import useTransitProgress from "hooks/fleet/useTransitProgress";
import useCooldownProgress from "hooks/fleet/useCooldownProgress";
import useAutomation from "automation/useAutomation";
import useGetMiningWaypoints from "hooks/systems/useGetMiningWaypoints";
import useGetMarketWaypoints from "hooks/systems/useGetMarketWaypoints";
import useGetBackendJobs from "hooks/backend/useGetBackendJobs";
import useUpsertBackendJob from "hooks/backend/useUpsertBackendJob";
import useSetBackendJobState from "hooks/backend/useSetBackendJobState";
import { isBackendConfigured } from "services/backendAxios";
import { useQuery } from "@tanstack/react-query";
import { getBackendRunLogs } from "services/backendJobs";
import {
    automationTemplates,
    getTemplateById,
    getTemplateIdForMode,
} from "automation/templates";
import type { Ship } from "types/fleet";
import type {
    AutomationStatus,
    AutomationMode,
    MiningAutomationConfig,
    AutomationRunState,
    AutomationTemplateId,
} from "automation/types";

import styles from "./Automation.module.css";
import { usePageTitle } from "components/Layout/PageTitleContext";
import ProgressBar from "components/Home/ProgressBar";
import { formatDuration } from "helpers/fleetFormatters";

type AutomationCardProps = {
    ship: Ship;
    config: MiningAutomationConfig;
    runState: AutomationRunState;
    status?: AutomationStatus;
    backendJobId?: string;
    backendRunId?: string;
    isBackendRunning?: boolean;
    isBackendPending?: boolean;
    onUpdate: (update: Partial<MiningAutomationConfig>) => void;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
    onBackendSave?: () => void;
    onBackendStart?: () => void;
    onBackendPause?: () => void;
    onBackendStop?: () => void;
};

const getTemplateDefaults = (templateId: string, ship: Ship) => {
    switch (templateId) {
        case "contract_fulfillment":
            return {
                mineWaypoint: ship.nav.waypointSymbol,
                marketWaypoint: ship.nav.waypointSymbol,
                intervalSeconds: 20,
                minFuelPercent: 20,
                minCargoFreeUnits: 0,
                autoRefuel: true,
            };
        case "mining_loop":
        default:
            return {
                mineWaypoint: ship.nav.waypointSymbol,
                marketWaypoint: ship.nav.waypointSymbol,
                tradeSymbol: "IRON_ORE",
                sellAtUnits: ship.cargo.capacity,
                intervalSeconds: 15,
                minFuelPercent: 15,
                minCargoFreeUnits: Math.max(
                    5,
                    Math.floor(ship.cargo.capacity * 0.1),
                ),
                autoRefuel: false,
            };
    }
};

const formatLogDuration = (durationMs?: number) => {
    if (typeof durationMs !== "number") return "";
    if (durationMs < 1000) return `${durationMs}ms`;
    return `${(durationMs / 1000).toFixed(1)}s`;
};

const formatBackoff = (iso?: string) => {
    if (!iso) return null;
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return null;
    const seconds = Math.max(
        0,
        Math.ceil((parsed.getTime() - Date.now()) / 1000),
    );
    return seconds > 0 ? `Backoff ${seconds}s` : null;
};

const AutomationCard = ({
    ship,
    config,
    runState,
    status,
    backendJobId,
    backendRunId,
    isBackendRunning,
    isBackendPending,
    onUpdate,
    onStart,
    onPause,
    onResume,
    onStop,
    onBackendSave,
    onBackendStart,
    onBackendPause,
    onBackendStop,
}: AutomationCardProps) => {
    const { data: miningWaypoints } = useGetMiningWaypoints(
        ship.nav.systemSymbol,
    );
    const { data: marketWaypoints } = useGetMarketWaypoints(
        ship.nav.systemSymbol,
    );
    const transit = useTransitProgress(ship);
    const cooldown = useCooldownProgress(ship);

    // Fetch backend job logs if job exists
    const { data: backendLogsData } = useQuery({
        queryKey: ["backend", "run", backendRunId, "logs"],
        queryFn: () => (backendRunId ? getBackendRunLogs(backendRunId) : null),
        enabled: !!backendRunId,
        refetchInterval: backendRunId && isBackendRunning ? 3000 : false,
    });

    const backendLogs = backendLogsData?.logs ?? [];

    const resolveDefaultWaypoint = (
        options: { symbol: string }[],
        fallbackSymbol: string,
        currentValue?: string,
    ) => {
        const symbols = new Set(options.map((waypoint) => waypoint.symbol));
        if (currentValue && symbols.has(currentValue)) {
            return currentValue;
        }
        if (symbols.has(fallbackSymbol)) {
            return fallbackSymbol;
        }
        return options[0]?.symbol ?? fallbackSymbol;
    };

    useEffect(() => {
        if (!miningWaypoints || miningWaypoints.length === 0) {
            return;
        }

        const nextMineWaypoint = resolveDefaultWaypoint(
            miningWaypoints,
            ship.nav.waypointSymbol,
            config.mineWaypoint,
        );

        if (nextMineWaypoint && nextMineWaypoint !== config.mineWaypoint) {
            onUpdate({ mineWaypoint: nextMineWaypoint });
        }
    }, [
        config.mineWaypoint,
        miningWaypoints,
        onUpdate,
        ship.nav.waypointSymbol,
    ]);

    useEffect(() => {
        if (!marketWaypoints || marketWaypoints.length === 0) {
            return;
        }

        const nextMarketWaypoint = resolveDefaultWaypoint(
            marketWaypoints,
            ship.nav.waypointSymbol,
            config.marketWaypoint,
        );

        if (
            nextMarketWaypoint &&
            nextMarketWaypoint !== config.marketWaypoint
        ) {
            onUpdate({ marketWaypoint: nextMarketWaypoint });
        }
    }, [
        config.marketWaypoint,
        marketWaypoints,
        onUpdate,
        ship.nav.waypointSymbol,
    ]);

    const miningOptions = miningWaypoints ?? [];
    const miningSelectOptions: { symbol: string; type?: string }[] =
        miningOptions.map((waypoint) => ({
            symbol: waypoint.symbol,
            type: waypoint.type,
        }));
    const miningOptionSymbols = new Set(
        miningSelectOptions.map((waypoint) => waypoint.symbol),
    );
    const addMiningOption = (symbol: string, type: string) => {
        if (!symbol || miningOptionSymbols.has(symbol)) {
            return;
        }

        miningOptionSymbols.add(symbol);
        miningSelectOptions.push({ symbol, type });
    };

    addMiningOption(ship.nav.waypointSymbol, "CURRENT");
    addMiningOption(config.mineWaypoint, "CUSTOM");

    const marketOptions = marketWaypoints ?? [];
    const marketSelectOptions: { symbol: string; type?: string }[] =
        marketOptions.map((waypoint) => ({
            symbol: waypoint.symbol,
            type: waypoint.type,
        }));
    const marketOptionSymbols = new Set(
        marketSelectOptions.map((waypoint) => waypoint.symbol),
    );
    const addMarketOption = (symbol: string, type: string) => {
        if (!symbol || marketOptionSymbols.has(symbol)) {
            return;
        }

        marketOptionSymbols.add(symbol);
        marketSelectOptions.push({ symbol, type });
    };

    addMarketOption(ship.nav.waypointSymbol, "CURRENT");
    addMarketOption(config.marketWaypoint, "CUSTOM");

    const modeValue: AutomationMode = config.mode ?? "mine_and_sell";
    const templateId = config.templateId ?? getTemplateIdForMode(modeValue);
    const template = getTemplateById(templateId) ?? automationTemplates[0];
    const isContractMode = modeValue === "contract_jobs";
    const isRunning = runState === "running";
    const isPaused = runState === "paused";
    const validationMessages: string[] = [];
    const hasMineWaypoint = Boolean(config.mineWaypoint);
    if (!hasMineWaypoint) {
        validationMessages.push("Select a mine waypoint.");
    }
    if (!isContractMode) {
        if (!config.marketWaypoint) {
            validationMessages.push("Select a market waypoint.");
        }
        if (!config.tradeSymbol?.trim()) {
            validationMessages.push("Enter a trade symbol.");
        }
        if (!config.sellAtUnits || config.sellAtUnits < 1) {
            validationMessages.push("Set a valid sell-at unit count.");
        }
    }
    if (!config.intervalSeconds || config.intervalSeconds < 5) {
        validationMessages.push("Interval must be at least 5 seconds.");
    }
    if (typeof config.minFuelPercent === "number") {
        if (config.minFuelPercent < 1 || config.minFuelPercent > 100) {
            validationMessages.push("Fuel threshold must be 1-100%.");
        }
    }
    const canStart = validationMessages.length === 0;
    const recentActions = status?.recentActions ?? [];
    const hasActivity = recentActions.length > 0;
    const backoffLabel = formatBackoff(status?.backoffUntil);
    const fuelCapacity = ship.fuel.capacity || 0;
    const lowFuelWithoutRefuel =
        fuelCapacity > 0 &&
        (config.minFuelPercent ?? 15) > 0 &&
        (ship.fuel.current / fuelCapacity) * 100 <
            (config.minFuelPercent ?? 15) &&
        !config.autoRefuel;

    return (
        <article className={styles.automationCard}>
            <div className={styles.automationCardHeader}>
                <div>
                    <p className={styles.automationShipName}>
                        {ship.registration.name}
                    </p>
                    <p className={styles.automationShipMeta}>
                        {ship.symbol} • {ship.nav.waypointSymbol}
                    </p>
                </div>
                <span
                    className={
                        isRunning
                            ? styles.automationStatusOn
                            : isPaused
                              ? styles.automationStatusPaused
                              : styles.automationStatusOff
                    }
                >
                    {isRunning ? "Running" : isPaused ? "Paused" : "Idle"}
                </span>
            </div>

            <div className={styles.automationFields}>
                <label className={styles.automationField}>
                    <span>Strategy template</span>
                    <select
                        value={templateId}
                        onChange={(event) => {
                            const nextTemplateId = event.target
                                .value as AutomationTemplateId;
                            const nextTemplate =
                                getTemplateById(nextTemplateId);
                            onUpdate({
                                ...getTemplateDefaults(nextTemplateId, ship),
                                mode: (nextTemplate?.mode ??
                                    modeValue) as AutomationMode,
                                templateId: nextTemplateId,
                            });
                        }}
                    >
                        {automationTemplates.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {template && (
                        <span className={styles.automationHint}>
                            {template.description}
                        </span>
                    )}
                </label>
                <label className={styles.automationField}>
                    <span>Mine waypoint</span>
                    <select
                        value={config.mineWaypoint}
                        onChange={(event) =>
                            onUpdate({ mineWaypoint: event.target.value })
                        }
                    >
                        {miningSelectOptions.length > 0 ? (
                            miningSelectOptions.map((waypoint) => (
                                <option
                                    key={`mine-${waypoint.symbol}`}
                                    value={waypoint.symbol}
                                >
                                    {waypoint.symbol}
                                    {waypoint.type ? ` (${waypoint.type})` : ""}
                                </option>
                            ))
                        ) : (
                            <option value={ship.nav.waypointSymbol}>
                                {ship.nav.waypointSymbol}
                            </option>
                        )}
                    </select>
                </label>
                {!isContractMode && (
                    <>
                        <label className={styles.automationField}>
                            <span>Market waypoint</span>
                            <select
                                value={config.marketWaypoint}
                                onChange={(event) =>
                                    onUpdate({
                                        marketWaypoint: event.target.value,
                                    })
                                }
                            >
                                {marketSelectOptions.length > 0 ? (
                                    marketSelectOptions.map((waypoint) => (
                                        <option
                                            key={`market-${waypoint.symbol}`}
                                            value={waypoint.symbol}
                                        >
                                            {waypoint.symbol}
                                            {waypoint.type
                                                ? ` (${waypoint.type})`
                                                : ""}
                                        </option>
                                    ))
                                ) : (
                                    <option value={ship.nav.waypointSymbol}>
                                        {ship.nav.waypointSymbol}
                                    </option>
                                )}
                            </select>
                        </label>
                        <label className={styles.automationField}>
                            <span>Trade symbol</span>
                            <input
                                value={config.tradeSymbol}
                                onChange={(event) =>
                                    onUpdate({
                                        tradeSymbol:
                                            event.target.value.toUpperCase(),
                                    })
                                }
                                placeholder="IRON_ORE"
                            />
                        </label>
                        <label className={styles.automationField}>
                            <span>Sell at units</span>
                            <input
                                type="number"
                                min={1}
                                value={config.sellAtUnits}
                                onChange={(event) =>
                                    onUpdate({
                                        sellAtUnits: Number(event.target.value),
                                    })
                                }
                            />
                        </label>
                    </>
                )}
                <label className={styles.automationField}>
                    <span>Interval (s)</span>
                    <input
                        type="number"
                        min={5}
                        value={config.intervalSeconds}
                        onChange={(event) =>
                            onUpdate({
                                intervalSeconds: Number(event.target.value),
                            })
                        }
                    />
                </label>
                <label className={styles.automationField}>
                    <span>Min fuel %</span>
                    <input
                        type="number"
                        min={1}
                        max={100}
                        value={config.minFuelPercent ?? 15}
                        onChange={(event) =>
                            onUpdate({
                                minFuelPercent: Number(event.target.value),
                            })
                        }
                    />
                </label>
                <label className={styles.automationToggle}>
                    <input
                        type="checkbox"
                        checked={Boolean(config.autoRefuel)}
                        onChange={(event) =>
                            onUpdate({ autoRefuel: event.target.checked })
                        }
                    />
                    <span>Auto-refuel when low</span>
                </label>
                {!isContractMode && (
                    <label className={styles.automationField}>
                        <span>Min cargo free units</span>
                        <input
                            type="number"
                            min={0}
                            value={config.minCargoFreeUnits ?? 0}
                            onChange={(event) =>
                                onUpdate({
                                    minCargoFreeUnits: Number(
                                        event.target.value,
                                    ),
                                })
                            }
                        />
                    </label>
                )}
                {validationMessages.length > 0 && (
                    <div className={styles.automationWarning}>
                        {validationMessages.join(" ")}
                    </div>
                )}
                {backoffLabel && (
                    <div className={styles.automationNotice}>
                        {backoffLabel}
                    </div>
                )}
                {lowFuelWithoutRefuel && (
                    <div className={styles.automationNotice}>
                        Fuel below threshold. Enable auto-refuel or refuel
                        manually.
                    </div>
                )}
            </div>

            {(transit.isInTransit || cooldown.isCoolingDown) && (
                <div className={styles.automationProgressPanel}>
                    {transit.isInTransit && (
                        <div className={styles.automationProgressBlock}>
                            <div className={styles.automationProgressHeader}>
                                <span>In transit</span>
                                {transit.arrivalTime && (
                                    <span>ETA {transit.arrivalTime}</span>
                                )}
                            </div>
                            <ProgressBar
                                current={transit.elapsedSeconds}
                                total={transit.totalSeconds}
                                label={`Arriving in ${formatDuration(
                                    transit.remainingSeconds,
                                )}`}
                            />
                        </div>
                    )}
                    {cooldown.isCoolingDown && (
                        <div className={styles.automationProgressBlock}>
                            <div className={styles.automationProgressHeader}>
                                <span>Cooldown</span>
                                {cooldown.readyTime && (
                                    <span>Ready {cooldown.readyTime}</span>
                                )}
                            </div>
                            <ProgressBar
                                current={cooldown.elapsedSeconds}
                                total={cooldown.totalSeconds}
                                label={`Ready in ${formatDuration(
                                    cooldown.remainingSeconds,
                                )}`}
                            />
                        </div>
                    )}
                </div>
            )}

            <div className={styles.automationFooter}>
                <div className={styles.automationStatusText}>
                    <p>
                        {status?.lastError
                            ? `Error: ${status.lastError}`
                            : status?.lastAction || "No actions yet."}
                    </p>
                    {status?.lastUpdated && (
                        <span>
                            {new Date(status.lastUpdated).toLocaleTimeString()}
                        </span>
                    )}
                </div>
                <div className={styles.automationButtons}>
                    {isRunning && (
                        <button
                            type="button"
                            className={styles.automationPause}
                            onClick={onPause}
                        >
                            Pause
                        </button>
                    )}
                    {isPaused && (
                        <button
                            type="button"
                            className={styles.automationStart}
                            onClick={onResume}
                        >
                            Resume
                        </button>
                    )}
                    {!isRunning && !isPaused && (
                        <button
                            type="button"
                            className={styles.automationStart}
                            onClick={onStart}
                            disabled={!canStart}
                        >
                            Start
                        </button>
                    )}
                    {(isRunning || isPaused) && (
                        <button
                            type="button"
                            className={styles.automationStop}
                            onClick={onStop}
                        >
                            Stop
                        </button>
                    )}
                </div>
            </div>

            {isBackendConfigured && (
                <div className={styles.automationBackendPanel}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >
                        <p className={styles.automationBackendLabel}>
                            Background automation
                        </p>
                        <div className={styles.automationBackendStatus}>
                            {!backendJobId ? (
                                <div
                                    className={
                                        styles.automationBackendStatusBadge +
                                        " " +
                                        styles.automationBackendStatusNone
                                    }
                                >
                                    <span>●</span>
                                    <span>No job saved</span>
                                </div>
                            ) : isBackendRunning ? (
                                <div
                                    className={
                                        styles.automationBackendStatusBadge +
                                        " " +
                                        styles.automationBackendStatusRunning
                                    }
                                >
                                    <span>●</span>
                                    <span>Running</span>
                                </div>
                            ) : (
                                <div
                                    className={
                                        styles.automationBackendStatusBadge +
                                        " " +
                                        styles.automationBackendStatusStopped
                                    }
                                >
                                    <span>●</span>
                                    <span>Stopped</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.automationBackendButtons}>
                        <button
                            type="button"
                            className={styles.automationBackendSave}
                            onClick={onBackendSave}
                            disabled={isBackendPending}
                        >
                            {backendJobId ? "Update job" : "Save job"}
                        </button>
                        {backendJobId && (
                            <>
                                {isBackendRunning && (
                                    <>
                                        <button
                                            type="button"
                                            className={
                                                styles.automationBackendPause
                                            }
                                            onClick={onBackendPause}
                                            disabled={isBackendPending}
                                        >
                                            Pause
                                        </button>
                                        <button
                                            type="button"
                                            className={
                                                styles.automationBackendStop
                                            }
                                            onClick={onBackendStop}
                                            disabled={isBackendPending}
                                        >
                                            Stop
                                        </button>
                                    </>
                                )}
                                {!isBackendRunning && (
                                    <button
                                        type="button"
                                        className={
                                            styles.automationBackendStart
                                        }
                                        onClick={onBackendStart}
                                        disabled={isBackendPending}
                                    >
                                        Start
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {backendJobId && (
                <div className={styles.automationBackendLog}>
                    <p className={styles.automationBackendLogTitle}>
                        Background job log
                    </p>
                    {!backendRunId ? (
                        <p className={styles.automationBackendLogEmpty}>
                            No run started yet
                        </p>
                    ) : backendLogs && backendLogs.length > 0 ? (
                        <ul className={styles.automationBackendLogList}>
                            {[...backendLogs].reverse().map((log, index) => (
                                <li
                                    key={`be-log-${index}`}
                                    className={styles.automationBackendLogItem}
                                >
                                    <span
                                        className={
                                            styles.automationBackendLogMessage
                                        }
                                    >
                                        {log.message}
                                    </span>
                                    <span
                                        className={
                                            styles.automationBackendLogTime
                                        }
                                    >
                                        {new Date(
                                            log.timestamp,
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                        })}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.automationBackendLogEmpty}>
                            No logs yet
                        </p>
                    )}
                </div>
            )}

            <div className={styles.automationLog}>
                <p className={styles.automationLogTitle}>Recent actions</p>
                {hasActivity ? (
                    <ul className={styles.automationLogList}>
                        {recentActions.map((entry, index) => (
                            <li
                                key={`${ship.symbol}-log-${index}`}
                                className={styles.automationLogItem}
                            >
                                <span
                                    className={
                                        entry.type === "error"
                                            ? styles.automationLogError
                                            : styles.automationLogAction
                                    }
                                >
                                    {entry.message}
                                </span>
                                <span className={styles.automationLogTime}>
                                    {new Date(
                                        entry.timestamp,
                                    ).toLocaleTimeString()}
                                    {formatLogDuration(entry.durationMs)
                                        ? ` • ${formatLogDuration(entry.durationMs)}`
                                        : ""}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.automationLogEmpty}>
                        No recent actions yet.
                    </p>
                )}
            </div>
        </article>
    );
};

const Automation = () => {
    usePageTitle("Fleet automation");

    const { data: ships, isLoading, error } = useGetShips();
    const { data: agent } = useGetAgent();
    const {
        configs,
        runState,
        status,
        upsertConfig,
        startAutomation,
        pauseAutomation,
        resumeAutomation,
        stopAutomation,
        stopAll,
    } = useAutomation();

    // Backend job integration
    const { data: backendJobs } = useGetBackendJobs(agent?.symbol);
    const { mutate: upsertBackendJob, isPending: isUpsertPending } =
        useUpsertBackendJob();
    const { mutate: setBackendJobState, isPending: isSetStatePending } =
        useSetBackendJobState();

    // Map backend jobs by ship symbol for easy lookup
    const backendJobsByShip = new Map(
        (backendJobs ?? []).map((job) => [job.shipSymbol, job]),
    );

    const getConfig = (ship: Ship) => {
        const stored = configs[ship.symbol];
        if (!stored) {
            return {
                shipSymbol: ship.symbol,
                mode: "mine_and_sell" as AutomationMode,
                templateId: getTemplateIdForMode("mine_and_sell"),
                mineWaypoint: ship.nav.waypointSymbol,
                marketWaypoint: ship.nav.waypointSymbol,
                tradeSymbol: "IRON_ORE",
                sellAtUnits: ship.cargo.capacity,
                intervalSeconds: 15,
                minFuelPercent: 15,
                minCargoFreeUnits: Math.max(
                    5,
                    Math.floor(ship.cargo.capacity * 0.1),
                ),
                autoRefuel: false,
            };
        }

        return {
            ...stored,
            mode: stored.mode ?? ("mine_and_sell" as AutomationMode),
            templateId:
                stored.templateId ??
                getTemplateIdForMode(stored.mode ?? "mine_and_sell"),
            minFuelPercent: stored.minFuelPercent ?? 15,
            minCargoFreeUnits:
                stored.minCargoFreeUnits ??
                Math.max(5, Math.floor(ship.cargo.capacity * 0.1)),
            autoRefuel: stored.autoRefuel ?? false,
        };
    };

    if (isLoading) {
        return <div className={styles.state}>Loading automation...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error: {error.message}</div>;
    }

    return (
        <section className={styles.automation}>
            <div className={styles.header}>
                <div>
                    <p className={styles.subtitle}>
                        Assign mining routes and run multiple ships.
                    </p>
                </div>
                <button
                    type="button"
                    className={styles.automationStopAll}
                    onClick={stopAll}
                >
                    Stop all
                </button>
            </div>

            {ships && ships.length > 0 ? (
                <div className={styles.automationGrid}>
                    {ships.map((ship) => {
                        const config = getConfig(ship);
                        const shipStatus = status[ship.symbol];
                        const currentRunState =
                            runState[ship.symbol] ?? "stopped";
                        const backendJob = backendJobsByShip.get(ship.symbol);

                        return (
                            <AutomationCard
                                key={`auto-${ship.symbol}`}
                                ship={ship}
                                config={config}
                                status={shipStatus}
                                runState={currentRunState}
                                backendJobId={backendJob?.id}
                                backendRunId={
                                    backendJob?.lastRunId ?? undefined
                                }
                                isBackendRunning={
                                    backendJob?.runState === "running"
                                }
                                isBackendPending={
                                    isUpsertPending || isSetStatePending
                                }
                                onUpdate={(update) =>
                                    upsertConfig({ ...config, ...update })
                                }
                                onStart={() => {
                                    upsertConfig(config);
                                    startAutomation(ship.symbol);
                                }}
                                onPause={() => pauseAutomation(ship.symbol)}
                                onResume={() => resumeAutomation(ship.symbol)}
                                onStop={() => stopAutomation(ship.symbol)}
                                onBackendSave={() => {
                                    if (!agent?.symbol) return;
                                    upsertBackendJob({
                                        shipSymbol: ship.symbol,
                                        agentSymbol: agent.symbol,
                                        mode: config.mode,
                                        templateId: config.templateId,
                                        config,
                                    });
                                }}
                                onBackendStart={() => {
                                    if (!backendJob?.id) return;
                                    setBackendJobState({
                                        jobId: backendJob.id,
                                        action: "start",
                                    });
                                }}
                                onBackendPause={() => {
                                    if (!backendJob?.id) return;
                                    setBackendJobState({
                                        jobId: backendJob.id,
                                        action: "pause",
                                    });
                                }}
                                onBackendStop={() => {
                                    if (!backendJob?.id) return;
                                    setBackendJobState({
                                        jobId: backendJob.id,
                                        action: "stop",
                                    });
                                }}
                            />
                        );
                    })}
                </div>
            ) : (
                <p className={styles.state}>No ships found.</p>
            )}
        </section>
    );
};

export default Automation;
