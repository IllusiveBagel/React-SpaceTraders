import { useMemo } from "react";

import { formatNumber } from "helpers/formatNumber";

import type { ServerStatus } from "types/status";

import Card from "components/Common/Card";

import styles from "./ServerSnapshot.module.css";

type ServerSnapshotProps = {
    serverStatus?: ServerStatus;
    serverStatusLoading?: boolean;
    serverStatusError?: boolean;
};

const ServerSnapshot = ({
    serverStatus,
    serverStatusLoading,
    serverStatusError,
}: ServerSnapshotProps) => {
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
        <Card
            title="Server snapshot"
            subTitle="Accounts, agents, ships, and systems"
        >
            {serverStatusLoading ? (
                <p className={styles.emptyState}>Loading snapshot...</p>
            ) : serverStatusError ? (
                <p className={styles.emptyState}>Snapshot unavailable.</p>
            ) : (
                <div className={styles.statusStatsGrid}>
                    {statusStatItems.map((item) => (
                        <div key={item.label} className={styles.statusStat}>
                            <span className={styles.statusStatLabel}>
                                {item.label}
                            </span>
                            <span className={styles.statusStatValue}>
                                {typeof item.value === "number"
                                    ? formatNumber(item.value)
                                    : "--"}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default ServerSnapshot;
