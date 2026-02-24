import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { formatNumber } from "helpers/formatNumber";

import { appendBackendStatsSnapshot } from "services/backendMissionControl";
import { isBackendConfigured } from "services/backendAxios";

import useGetBackendCycle from "hooks/backend/useGetBackendCycle";
import useGetBackendStats from "hooks/backend/useGetBackendStats";
import useGetAgent from "hooks/agent/useGetAgent";
import useGetContracts from "hooks/contracts/useGetContracts";
import useGetShips from "hooks/fleet/useGetShips";
import useGetStatus from "hooks/status/useGetStatus";

import { usePageTitle } from "components/Layout/PageTitleContext";
import CreditsOverTime from "components/Dashboard/CreditsOverTime";
import ServerStatus from "components/Dashboard/ServerStatus";
import FleetUtilization from "components/Dashboard/FleetUtilization";
import ServerSnapshot from "components/Dashboard/ServerSnapshot";
import ContractProgress from "components/Dashboard/ContractProgress";

import styles from "./Home.module.css";
import Announcements from "components/Dashboard/Announcements";

type HistoryPoint = {
    ts: number;
    value: number;
};

const CREDITS_HISTORY_KEY = "dashboard:creditsHistory";
const BACKEND_SNAPSHOT_TS_PREFIX = "dashboard:lastBackendSnapshotAt";
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
    const queryClient = useQueryClient();

    const { data: agent } = useGetAgent();
    const { data: ships } = useGetShips();
    const { data: contracts } = useGetContracts();
    const {
        data: serverStatus,
        isLoading: serverStatusLoading,
        isError: serverStatusError,
    } = useGetStatus();
    const { data: backendCycle } = useGetBackendCycle();
    const { data: backendStats } = useGetBackendStats({
        agentSymbol: agent?.symbol,
        cycleId: backendCycle?.id,
    });

    const localCreditsHistory = useCreditsHistory(agent?.credits);
    const backendCreditsHistory = useMemo(() => {
        return (backendStats?.snapshots ?? [])
            .filter(
                (snapshot) =>
                    typeof snapshot.credits === "number" &&
                    typeof snapshot.timestamp === "string",
            )
            .map((snapshot) => ({
                ts: new Date(snapshot.timestamp).getTime(),
                value: snapshot.credits as number,
            }))
            .filter((point) => Number.isFinite(point.ts))
            .sort((a, b) => a.ts - b.ts)
            .slice(-HISTORY_MAX_POINTS);
    }, [backendStats?.snapshots]);
    const creditsHistory =
        backendCreditsHistory.length > 0
            ? backendCreditsHistory
            : localCreditsHistory;

    useEffect(() => {
        const hasRequiredData =
            isBackendConfigured &&
            Boolean(agent?.symbol) &&
            typeof agent?.credits === "number" &&
            Array.isArray(ships) &&
            Array.isArray(contracts);

        if (!hasRequiredData) {
            return;
        }

        const snapshotKey = `${BACKEND_SNAPSHOT_TS_PREFIX}:${agent.symbol}`;
        const now = Date.now();
        const rawLastSnapshotAt =
            typeof window === "undefined"
                ? undefined
                : localStorage.getItem(snapshotKey);
        const lastSnapshotAt = rawLastSnapshotAt
            ? Number.parseInt(rawLastSnapshotAt, 10)
            : 0;

        if (lastSnapshotAt && now - lastSnapshotAt < HISTORY_MIN_INTERVAL_MS) {
            return;
        }

        const contractsOpen = contracts.filter(
            (contract) => contract.accepted && !contract.fulfilled,
        ).length;
        const contractsFulfilled = contracts.filter(
            (contract) => contract.fulfilled,
        ).length;

        appendBackendStatsSnapshot(agent.symbol, {
            credits: agent.credits,
            shipCount: ships.length,
            contractsOpen,
            contractsFulfilled,
        })
            .then(() => {
                if (typeof window === "undefined") {
                    return;
                }

                localStorage.setItem(snapshotKey, String(now));
                queryClient.invalidateQueries({
                    queryKey: ["backend", "stats", agent.symbol],
                });
            })
            .catch(() => undefined);
    }, [agent, contracts, queryClient, ships]);

    const creditsPerHour = useMemo(() => {
        if (creditsHistory.length < 2) return undefined;
        const first = creditsHistory[0];
        const last = creditsHistory[creditsHistory.length - 1];
        const hours = (last.ts - first.ts) / (1000 * 60 * 60);
        if (hours <= 0) return undefined;
        return (last.value - first.value) / hours;
    }, [creditsHistory]);

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
                        <span className={styles.metaSubValue}>
                            {typeof creditsPerHour === "number"
                                ? `${creditsPerHour >= 0 ? "+" : ""}${formatNumber(creditsPerHour)}/hr`
                                : "--"}
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
                <CreditsOverTime creditsHistory={creditsHistory} />
                <FleetUtilization />
                <ContractProgress
                    activeContractProgress={activeContractProgress}
                />
                <ServerStatus agent={agent ?? { symbol: "" }} />
                <Announcements />
                <ServerSnapshot
                    serverStatus={serverStatus}
                    serverStatusLoading={serverStatusLoading}
                    serverStatusError={serverStatusError}
                />
            </section>
        </div>
    );
};

export default Home;
