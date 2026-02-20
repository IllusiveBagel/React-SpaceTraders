import useGetShips from "hooks/fleet/useGetShips";
import useAutomation from "automation/useAutomation";
import useGetMiningWaypoints from "hooks/systems/useGetMiningWaypoints";
import type { Ship } from "types/fleet";
import type {
    AutomationStatus,
    MiningAutomationConfig,
} from "automation/types";

import styles from "./Automation.module.css";
import { usePageTitle } from "components/Layout/PageTitleContext";

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
    const datalistId = `mining-${ship.symbol}`;

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
                    <span>Mine waypoint</span>
                    <input
                        list={datalistId}
                        value={config.mineWaypoint}
                        onChange={(event) =>
                            onUpdate({
                                mineWaypoint: event.target.value,
                            })
                        }
                        placeholder="X1-Y1-A1"
                    />
                </label>
                <datalist id={datalistId}>
                    {(miningWaypoints ?? []).map((waypoint) => (
                        <option key={waypoint.symbol} value={waypoint.symbol}>
                            {waypoint.type}
                        </option>
                    ))}
                </datalist>
                <label className={styles.automationField}>
                    <span>Market waypoint</span>
                    <input
                        value={config.marketWaypoint}
                        onChange={(event) =>
                            onUpdate({
                                marketWaypoint: event.target.value,
                            })
                        }
                        placeholder="X1-Y1-A1"
                    />
                </label>
                <label className={styles.automationField}>
                    <span>Trade symbol</span>
                    <input
                        value={config.tradeSymbol}
                        onChange={(event) =>
                            onUpdate({
                                tradeSymbol: event.target.value.toUpperCase(),
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

    const getDefaults = (shipSymbol: string) => {
        return configs[shipSymbol];
    };

    const getConfig = (ship: Ship) => {
        return (
            getDefaults(ship.symbol) ?? {
                shipSymbol: ship.symbol,
                mineWaypoint: ship.nav.waypointSymbol,
                marketWaypoint: ship.nav.waypointSymbol,
                tradeSymbol: "IRON_ORE",
                sellAtUnits: ship.cargo.capacity,
                intervalSeconds: 15,
            }
        );
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
