import { useEffect, useMemo, useState } from "react";

import useGetAgent from "hooks/agent/useGetAgent";
import useGetContracts from "hooks/contracts/useGetContracts";
import useGetShips from "hooks/fleet/useGetShips";
import useGetStatus from "hooks/status/useGetStatus";
import { usePageTitle } from "components/Layout/PageTitleContext";

import styles from "./Home.module.css";

type HistoryPoint = {
    ts: number;
    value: number;
};

const CREDITS_HISTORY_KEY = "dashboard:creditsHistory";
const HISTORY_MAX_POINTS = 60;
const HISTORY_MIN_INTERVAL_MS = 5 * 60 * 1000;

const readHistory = (key: string): HistoryPoint[] => {
    if (typeof window === "undefined") return [];

    try {
        const stored = localStorage.getItem(key);
        if (!stored) return [];
        const parsed = JSON.parse(stored) as HistoryPoint[];
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (point) =>
                typeof point?.ts === "number" &&
                typeof point?.value === "number",
        );
    } catch {
        return [];
    }
};

const writeHistory = (key: string, history: HistoryPoint[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(history));
};

const useCreditsHistory = (credits?: number) => {
    const [history, setHistory] = useState<HistoryPoint[]>(() =>
        readHistory(CREDITS_HISTORY_KEY),
    );

    useEffect(() => {
        if (typeof credits !== "number") return;

        const now = Date.now();
        let nextHistory = readHistory(CREDITS_HISTORY_KEY);
        const lastPoint = nextHistory[nextHistory.length - 1];

        const shouldAppend =
            !lastPoint ||
            now - lastPoint.ts >= HISTORY_MIN_INTERVAL_MS ||
            lastPoint.value !== credits;

        if (shouldAppend) {
            nextHistory = [
                ...nextHistory,
                {
                    ts: now,
                    value: credits,
                },
            ];
        }

        if (nextHistory.length > HISTORY_MAX_POINTS) {
            nextHistory = nextHistory.slice(-HISTORY_MAX_POINTS);
        }

        writeHistory(CREDITS_HISTORY_KEY, nextHistory);
        setHistory(nextHistory);
    }, [credits]);

    return history;
};

const buildSparklinePath = (
    values: number[],
    width = 260,
    height = 90,
    padding = 8,
) => {
    if (values.length === 0) return "";

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const span = values.length - 1 || 1;

    return values
        .map((value, index) => {
            const x = padding + (index / span) * (width - padding * 2);
            const y =
                padding + (1 - (value - min) / range) * (height - padding * 2);
            return `${index === 0 ? "M" : "L"}${x} ${y}`;
        })
        .join(" ");
};

const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);

const formatDateTime = (value?: string) => {
    if (!value) return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString();
};

const getStatusTone = (status?: string, hasError?: boolean) => {
    if (hasError) return "error";
    const normalized = status?.toLowerCase() ?? "";

    if (normalized.includes("up") || normalized.includes("ok")) return "ok";
    if (normalized.includes("degraded") || normalized.includes("warn")) {
        return "warn";
    }

    return normalized ? "warn" : "unknown";
};

const Home = () => {
    usePageTitle("Home");

    const { data: agent } = useGetAgent();
    const { data: ships } = useGetShips();
    const { data: contracts } = useGetContracts();
    const {
        data: serverStatus,
        isLoading: serverStatusLoading,
        isError: serverStatusError,
    } = useGetStatus();

    const creditsHistory = useCreditsHistory(agent?.credits);

    const creditsValues = useMemo(
        () => creditsHistory.map((point) => point.value),
        [creditsHistory],
    );

    const creditsDelta = useMemo(() => {
        if (creditsValues.length < 2) return 0;
        return creditsValues[creditsValues.length - 1] - creditsValues[0];
    }, [creditsValues]);

    const sparklinePath = useMemo(
        () => buildSparklinePath(creditsValues),
        [creditsValues],
    );

    const fleetUtilization = useMemo(() => {
        const counts = {
            inTransit: 0,
            docked: 0,
            orbit: 0,
            other: 0,
        };

        (ships ?? []).forEach((ship) => {
            const status = ship.nav.status?.toUpperCase();
            if (status === "IN_TRANSIT") counts.inTransit += 1;
            else if (status === "DOCKED") counts.docked += 1;
            else if (status === "IN_ORBIT") counts.orbit += 1;
            else counts.other += 1;
        });

        return counts;
    }, [ships]);

    const totalShips = ships?.length ?? 0;

    const activeContractProgress = useMemo(() => {
        return (contracts ?? [])
            .filter((contract) => contract.accepted && !contract.fulfilled)
            .map((contract) => {
                const totals = contract.terms.deliver.reduce(
                    (acc, item) => {
                        acc.required += item.unitsRequired;
                        acc.fulfilled += item.unitsFulfilled;
                        return acc;
                    },
                    { required: 0, fulfilled: 0 },
                );

                const progress =
                    totals.required === 0
                        ? 0
                        : totals.fulfilled / totals.required;

                return {
                    id: contract.id,
                    label: `${contract.factionSymbol} ${contract.type}`,
                    progress,
                    remaining: totals.required - totals.fulfilled,
                    deadline: contract.terms.deadline,
                };
            })
            .sort((a, b) => a.remaining - b.remaining);
    }, [contracts]);

    const topCommodities = useMemo(() => {
        const totals = new Map<string, number>();
        (ships ?? []).forEach((ship) => {
            ship.cargo.inventory.forEach((item) => {
                totals.set(
                    item.symbol,
                    (totals.get(item.symbol) ?? 0) + item.units,
                );
            });
        });

        return Array.from(totals.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([symbol, units]) => ({ symbol, units }));
    }, [ships]);

    const maxCommodityUnits =
        topCommodities.reduce((max, item) => Math.max(max, item.units), 0) || 1;

    const statusTone = useMemo(
        () => getStatusTone(serverStatus?.status, serverStatusError),
        [serverStatus?.status, serverStatusError],
    );

    const statusLabel = useMemo(() => {
        if (serverStatusLoading) return "Checking...";
        if (serverStatusError) return "Unavailable";
        return serverStatus?.status ?? "Unknown";
    }, [serverStatusLoading, serverStatusError, serverStatus?.status]);

    const statusDetail = useMemo(() => {
        if (serverStatusLoading) return "Awaiting response";
        if (serverStatusError) return "Status check failed";

        const resetDate = serverStatus?.resetDate
            ? new Date(serverStatus.resetDate).toLocaleDateString()
            : undefined;
        const resetLabel = resetDate ? `Reset ${resetDate}` : undefined;
        const versionLabel = serverStatus?.version
            ? `v${serverStatus.version}`
            : undefined;

        return [resetLabel, versionLabel].filter(Boolean).join(" | ");
    }, [serverStatusLoading, serverStatusError, serverStatus]);

    const statusDotClass = useMemo(() => {
        if (statusTone === "ok") return styles.statusDotOk;
        if (statusTone === "warn") return styles.statusDotWarn;
        if (statusTone === "error") return styles.statusDotError;
        return styles.statusDotUnknown;
    }, [statusTone]);

    const statusStats = serverStatus?.stats;
    const statusStatItems = useMemo(
        () => [
            { label: "Accounts", value: statusStats?.accounts },
            { label: "Agents", value: statusStats?.agents },
            { label: "Ships", value: statusStats?.ships },
            { label: "Systems", value: statusStats?.systems },
            { label: "Waypoints", value: statusStats?.waypoints },
        ],
        [statusStats],
    );

    return (
        <div className={styles.home}>
            <header className={styles.header}>
                <div>
                    <p className={styles.kicker}>Mission control</p>
                    <h1 className={styles.title}>Fleet dashboard</h1>
                </div>
                <div className={styles.headerMeta}>
                    <div className={styles.metaBlock}>
                        <span className={styles.metaLabel}>Credits</span>
                        <span className={styles.metaValue}>
                            {agent ? formatNumber(agent.credits) : "--"}
                        </span>
                    </div>
                    <div className={styles.metaBlock}>
                        <span className={styles.metaLabel}>Ships</span>
                        <span className={styles.metaValue}>
                            {ships ? totalShips : "--"}
                        </span>
                    </div>
                    <div className={styles.metaBlock}>
                        <span className={styles.metaLabel}>
                            Active contracts
                        </span>
                        <span className={styles.metaValue}>
                            {contracts ? activeContractProgress.length : "--"}
                        </span>
                    </div>
                    <div className={styles.metaBlock}>
                        <span className={styles.metaLabel}>Server status</span>
                        <span className={styles.metaValueRow}>
                            <span
                                className={`${styles.statusDot} ${statusDotClass}`}
                                aria-hidden="true"
                            />
                            {statusLabel}
                        </span>
                        <span className={styles.statusDetail}>
                            {statusDetail || "Status details unavailable"}
                        </span>
                    </div>
                </div>
            </header>

            <section className={styles.grid}>
                <article className={`${styles.card} ${styles.cardWide}`}>
                    <div className={styles.cardHeader}>
                        <div>
                            <h2 className={styles.cardTitle}>
                                Credits over time
                            </h2>
                            <p className={styles.cardSub}>
                                Last saved snapshots
                            </p>
                        </div>
                        <div
                            className={`${
                                styles.trend
                            } ${creditsDelta >= 0 ? styles.trendUp : styles.trendDown}`}
                        >
                            {creditsDelta >= 0 ? "+" : ""}
                            {formatNumber(creditsDelta)}
                        </div>
                    </div>
                    <div className={styles.cardBody}>
                        {creditsValues.length > 1 ? (
                            <svg
                                className={styles.sparkline}
                                viewBox="0 0 260 90"
                                role="img"
                                aria-label="Credits sparkline"
                            >
                                <path
                                    className={styles.sparklinePath}
                                    d={sparklinePath}
                                />
                            </svg>
                        ) : (
                            <p className={styles.emptyState}>
                                Collecting your first data points.
                            </p>
                        )}
                    </div>
                </article>

                <article className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div>
                            <h2 className={styles.cardTitle}>
                                Fleet utilization
                            </h2>
                            <p className={styles.cardSub}>
                                Current ship statuses
                            </p>
                        </div>
                    </div>
                    <div className={styles.cardBody}>
                        {totalShips > 0 ? (
                            <>
                                <div className={styles.stackedBar}>
                                    <span
                                        className={`${styles.segment} ${styles.segmentTransit}`}
                                        style={{
                                            width: `${
                                                (fleetUtilization.inTransit /
                                                    totalShips) *
                                                100
                                            }%`,
                                        }}
                                    />
                                    <span
                                        className={`${styles.segment} ${styles.segmentDocked}`}
                                        style={{
                                            width: `${
                                                (fleetUtilization.docked /
                                                    totalShips) *
                                                100
                                            }%`,
                                        }}
                                    />
                                    <span
                                        className={`${styles.segment} ${styles.segmentOrbit}`}
                                        style={{
                                            width: `${
                                                (fleetUtilization.orbit /
                                                    totalShips) *
                                                100
                                            }%`,
                                        }}
                                    />
                                    <span
                                        className={`${styles.segment} ${styles.segmentOther}`}
                                        style={{
                                            width: `${
                                                (fleetUtilization.other /
                                                    totalShips) *
                                                100
                                            }%`,
                                        }}
                                    />
                                </div>
                                <div className={styles.legend}>
                                    <span>
                                        In transit: {fleetUtilization.inTransit}
                                    </span>
                                    <span>
                                        Docked: {fleetUtilization.docked}
                                    </span>
                                    <span>
                                        In orbit: {fleetUtilization.orbit}
                                    </span>
                                    <span>Other: {fleetUtilization.other}</span>
                                </div>
                            </>
                        ) : (
                            <p className={styles.emptyState}>
                                No ships discovered yet.
                            </p>
                        )}
                    </div>
                </article>

                <article className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div>
                            <h2 className={styles.cardTitle}>
                                Contract progress
                            </h2>
                            <p className={styles.cardSub}>
                                Remaining units by contract
                            </p>
                        </div>
                    </div>
                    <div className={styles.cardBody}>
                        {activeContractProgress.length > 0 ? (
                            <div className={styles.progressList}>
                                {activeContractProgress.map((contract) => (
                                    <div
                                        key={contract.id}
                                        className={styles.progressItem}
                                    >
                                        <div className={styles.progressMeta}>
                                            <span>{contract.label}</span>
                                            <span>
                                                {Math.round(
                                                    contract.progress * 100,
                                                )}
                                                %
                                            </span>
                                        </div>
                                        <div className={styles.progressTrack}>
                                            <span
                                                className={styles.progressFill}
                                                style={{
                                                    width: `${Math.round(
                                                        contract.progress * 100,
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                        <p className={styles.progressFoot}>
                                            {contract.remaining} units remaining
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.emptyState}>
                                No active contracts yet.
                            </p>
                        )}
                    </div>
                </article>

                <article className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div>
                            <h2 className={styles.cardTitle}>
                                Top commodities (cargo units)
                            </h2>
                            <p className={styles.cardSub}>
                                Profit tracking placeholder
                            </p>
                        </div>
                    </div>
                    <div className={styles.cardBody}>
                        {topCommodities.length > 0 ? (
                            <div className={styles.barList}>
                                {topCommodities.map((item) => (
                                    <div
                                        key={item.symbol}
                                        className={styles.barRow}
                                    >
                                        <div className={styles.barLabel}>
                                            {item.symbol}
                                        </div>
                                        <div className={styles.barTrack}>
                                            <span
                                                className={styles.barFill}
                                                style={{
                                                    width: `${
                                                        (item.units /
                                                            maxCommodityUnits) *
                                                        100
                                                    }%`,
                                                }}
                                            />
                                        </div>
                                        <div className={styles.barValue}>
                                            {item.units}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.emptyState}>
                                No cargo data yet.
                            </p>
                        )}
                    </div>
                </article>

                <article className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div>
                            <h2 className={styles.cardTitle}>Server status</h2>
                            <p className={styles.cardSub}>
                                Next reset and recent updates
                            </p>
                        </div>
                    </div>
                    <div className={styles.cardBody}>
                        {serverStatusLoading ? (
                            <p className={styles.emptyState}>
                                Loading server status...
                            </p>
                        ) : serverStatusError ? (
                            <p className={styles.emptyState}>
                                Unable to load server status.
                            </p>
                        ) : (
                            <>
                                <p className={styles.statusMetaLine}>
                                    {`Next reset: ${
                                        formatDateTime(
                                            serverStatus?.serverResets?.next,
                                        ) ?? "Unknown"
                                    }`}
                                    {serverStatus?.serverResets?.frequency
                                        ? ` | ${serverStatus.serverResets.frequency}`
                                        : ""}
                                </p>
                                <p className={styles.statusMetaLine}>
                                    {`Last market update: ${
                                        formatDateTime(
                                            serverStatus?.health
                                                ?.lastMarketUpdate,
                                        ) ?? "Unknown"
                                    }`}
                                </p>
                                <div className={styles.statusAnnouncements}>
                                    <p className={styles.statusSectionLabel}>
                                        Announcements
                                    </p>
                                    {serverStatus?.announcements?.length ? (
                                        <ul className={styles.statusList}>
                                            {serverStatus.announcements.map(
                                                (item, index) => (
                                                    <li
                                                        key={`${item.title ?? "announcement"}-${index}`}
                                                        className={
                                                            styles.statusListItem
                                                        }
                                                    >
                                                        <strong>
                                                            {item.title ??
                                                                "Untitled"}
                                                        </strong>
                                                        <span
                                                            className={
                                                                styles.statusListBody
                                                            }
                                                        >
                                                            {item.body ??
                                                                "No details provided."}
                                                        </span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    ) : (
                                        <p className={styles.statusEmpty}>
                                            No announcements.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </article>

                <article className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div>
                            <h2 className={styles.cardTitle}>
                                Server snapshot
                            </h2>
                            <p className={styles.cardSub}>
                                Accounts, agents, ships, and systems
                            </p>
                        </div>
                    </div>
                    <div className={styles.cardBody}>
                        {serverStatusLoading ? (
                            <p className={styles.emptyState}>
                                Loading snapshot...
                            </p>
                        ) : serverStatusError ? (
                            <p className={styles.emptyState}>
                                Snapshot unavailable.
                            </p>
                        ) : (
                            <div className={styles.statusStatsGrid}>
                                {statusStatItems.map((item) => (
                                    <div
                                        key={item.label}
                                        className={styles.statusStat}
                                    >
                                        <span
                                            className={styles.statusStatLabel}
                                        >
                                            {item.label}
                                        </span>
                                        <span
                                            className={styles.statusStatValue}
                                        >
                                            {typeof item.value === "number"
                                                ? formatNumber(item.value)
                                                : "--"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </article>
            </section>
        </div>
    );
};

export default Home;
