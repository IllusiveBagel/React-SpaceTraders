import { useState } from "react";

import { formatDateTime } from "helpers/formatNumber";

import { isBackendConfigured } from "services/backendAxios";

import useGetBackendCycle from "hooks/backend/useGetBackendCycle";
import useGetBackendStats from "hooks/backend/useGetBackendStats";
import useResetBackendCycle from "hooks/backend/useResetBackendCycle";
import useGetStatus from "hooks/status/useGetStatus";

import Card from "components/Common/Card";

import styles from "./ServerStatus.module.css";

const CREDITS_HISTORY_KEY = "dashboard:creditsHistory";

const ServerStatus = ({ agent }: { agent: { symbol: string } }) => {
    const {
        data: serverStatus,
        isLoading: serverStatusLoading,
        isError: serverStatusError,
    } = useGetStatus();
    const {
        data: backendCycle,
        isLoading: backendCycleLoading,
        isError: backendCycleError,
    } = useGetBackendCycle();
    const {
        data: backendStats,
        isLoading: backendStatsLoading,
        isError: backendStatsError,
    } = useGetBackendStats({
        agentSymbol: agent?.symbol,
        cycleId: backendCycle?.id,
    });

    const resetBackendCycleMutation = useResetBackendCycle();
    const [resetMessage, setResetMessage] = useState<string | null>(null);
    const [resetError, setResetError] = useState<string | null>(null);

    const handleResetBackendCycle = async () => {
        if (!isBackendConfigured) {
            setResetError("Backend is not configured.");
            setResetMessage(null);
            return;
        }

        setResetError(null);
        setResetMessage(null);

        try {
            const result =
                await resetBackendCycleMutation.mutateAsync("manual");

            if (typeof window !== "undefined") {
                localStorage.removeItem(CREDITS_HISTORY_KEY);
            }

            setResetMessage(
                `Cycle reset. New cycle started ${formatDateTime(result.activeCycle.startedAt) ?? "now"}.`,
            );
        } catch (error) {
            setResetError(
                error instanceof Error
                    ? error.message
                    : "Failed to reset backend cycle.",
            );
        }
    };

    return (
        <Card title="Server status" subTitle="Next reset and recent updates">
            {serverStatusLoading ? (
                <p className={styles.emptyState}>Loading server status...</p>
            ) : serverStatusError ? (
                <p className={styles.emptyState}>
                    Unable to load server status.
                </p>
            ) : (
                <>
                    <p className={styles.statusMetaLine}>
                        {`Next reset: ${
                            formatDateTime(serverStatus?.serverResets?.next) ??
                            "Unknown"
                        }`}
                        {serverStatus?.serverResets?.frequency
                            ? ` | ${serverStatus.serverResets.frequency}`
                            : ""}
                    </p>
                    <p className={styles.statusMetaLine}>
                        {`Last market update: ${
                            formatDateTime(
                                serverStatus?.health?.lastMarketUpdate,
                            ) ?? "Unknown"
                        }`}
                    </p>
                    {isBackendConfigured && (
                        <>
                            <p className={styles.statusMetaLine}>
                                {`Backend cycle: ${
                                    backendCycleLoading
                                        ? "Loading..."
                                        : backendCycleError
                                          ? "Unavailable"
                                          : (formatDateTime(
                                                backendCycle?.startedAt,
                                            ) ?? "Unknown")
                                }`}
                            </p>
                            <p className={styles.statusMetaLine}>
                                {`Backend stats: ${
                                    backendStatsLoading
                                        ? "Loading..."
                                        : backendStatsError
                                          ? "Unavailable"
                                          : `${
                                                backendStats?.snapshots
                                                    ?.length ?? 0
                                            } snapshots`
                                }`}
                            </p>
                            <div className={styles.statusActions}>
                                <button
                                    type="button"
                                    className={styles.resetButton}
                                    onClick={handleResetBackendCycle}
                                    disabled={
                                        resetBackendCycleMutation.isPending
                                    }
                                >
                                    {resetBackendCycleMutation.isPending
                                        ? "Resetting..."
                                        : "Reset backend cycle"}
                                </button>
                                {resetError && (
                                    <p className={styles.statusActionError}>
                                        {resetError}
                                    </p>
                                )}
                                {resetMessage && (
                                    <p className={styles.statusActionMessage}>
                                        {resetMessage}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
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
                                            className={styles.statusListItem}
                                        >
                                            <strong>
                                                {item.title ?? "Untitled"}
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
        </Card>
    );
};

export default ServerStatus;
