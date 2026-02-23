import { useEffect } from "react";

import useGetShips from "hooks/fleet/useGetShips";
import useTransitProgress from "hooks/fleet/useTransitProgress";
import useCooldownProgress from "hooks/fleet/useCooldownProgress";
import useAutomation from "automation/useAutomation";
import useGetMiningWaypoints from "hooks/systems/useGetMiningWaypoints";
import useGetMarketWaypoints from "hooks/systems/useGetMarketWaypoints";
import type { Ship } from "types/fleet";
import type {
    AutomationStatus,
    AutomationMode,
    MiningAutomationConfig,
} from "automation/types";

import styles from "./Automation.module.css";
import { usePageTitle } from "components/Layout/PageTitleContext";
import ProgressBar from "components/Home/ProgressBar";
import { formatDuration } from "helpers/fleetFormatters";

type AutomationCardProps = {
    ship: Ship;
    config: MiningAutomationConfig;
    isRunning: boolean;
    status?: AutomationStatus;
    onUpdate: (update: Partial<MiningAutomationConfig>) => void;
    onStart: () => void;
    onStop: () => void;
};

const AutomationCard = ({
    ship,
    config,
    isRunning,
    status,
    onUpdate,
    onStart,
    onStop,
}: AutomationCardProps) => {
    const { data: miningWaypoints } = useGetMiningWaypoints(
        ship.nav.systemSymbol,
    );
    const { data: marketWaypoints } = useGetMarketWaypoints(
        ship.nav.systemSymbol,
    );
    const transit = useTransitProgress(ship);
    const cooldown = useCooldownProgress(ship);

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

    const modeValue: AutomationMode = config.mode ?? "mine_and_sell";
    const isContractMode = modeValue === "contract_jobs";
    const recentActions = status?.recentActions ?? [];
    const hasActivity = recentActions.length > 0;

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
                            : styles.automationStatusOff
                    }
                >
                    {isRunning ? "Running" : "Idle"}
                </span>
            </div>

            <div className={styles.automationFields}>
                <label className={styles.automationField}>
                    <span>Automation</span>
                    <select
                        value={modeValue}
                        onChange={(event) =>
                            onUpdate({
                                mode: event.target.value as AutomationMode,
                            })
                        }
                    >
                        <option value="mine_and_sell">Mine and sell</option>
                        <option value="contract_jobs">Contract jobs</option>
                    </select>
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
                    {isRunning ? (
                        <button
                            type="button"
                            className={styles.automationStop}
                            onClick={onStop}
                        >
                            Stop
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={styles.automationStart}
                            onClick={onStart}
                        >
                            Start
                        </button>
                    )}
                </div>
            </div>

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
    const {
        configs,
        running,
        status,
        upsertConfig,
        startAutomation,
        stopAutomation,
        stopAll,
    } = useAutomation();

    const getConfig = (ship: Ship) => {
        const stored = configs[ship.symbol];
        if (!stored) {
            return {
                shipSymbol: ship.symbol,
                mode: "mine_and_sell" as AutomationMode,
                mineWaypoint: ship.nav.waypointSymbol,
                marketWaypoint: ship.nav.waypointSymbol,
                tradeSymbol: "IRON_ORE",
                sellAtUnits: ship.cargo.capacity,
                intervalSeconds: 15,
            };
        }

        return {
            ...stored,
            mode: stored.mode ?? ("mine_and_sell" as AutomationMode),
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
                        const isRunning = Boolean(running[ship.symbol]);

                        return (
                            <AutomationCard
                                key={`auto-${ship.symbol}`}
                                ship={ship}
                                config={config}
                                status={shipStatus}
                                isRunning={isRunning}
                                onUpdate={(update) =>
                                    upsertConfig({ ...config, ...update })
                                }
                                onStart={() => {
                                    upsertConfig(config);
                                    startAutomation(ship.symbol);
                                }}
                                onStop={() => stopAutomation(ship.symbol)}
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
