import { useMemo } from "react";

import useGetShips from "hooks/fleet/useGetShips";

import Card from "components/Common/Card";

import styles from "./FleetUtilization.module.css";

const FleetUtilization = () => {
    const { data: ships } = useGetShips();

    const totalShips = ships?.length ?? 0;

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

    return (
        <Card title="Fleet utilization" subTitle="Current ship statuses">
            {totalShips > 0 ? (
                <>
                    <div className={styles.stackedBar}>
                        <span
                            className={`${styles.segment} ${styles.segmentTransit}`}
                            style={{
                                width: `${
                                    (fleetUtilization.inTransit / totalShips) *
                                    100
                                }%`,
                            }}
                        />
                        <span
                            className={`${styles.segment} ${styles.segmentDocked}`}
                            style={{
                                width: `${
                                    (fleetUtilization.docked / totalShips) * 100
                                }%`,
                            }}
                        />
                        <span
                            className={`${styles.segment} ${styles.segmentOrbit}`}
                            style={{
                                width: `${
                                    (fleetUtilization.orbit / totalShips) * 100
                                }%`,
                            }}
                        />
                        <span
                            className={`${styles.segment} ${styles.segmentOther}`}
                            style={{
                                width: `${
                                    (fleetUtilization.other / totalShips) * 100
                                }%`,
                            }}
                        />
                    </div>
                    <div className={styles.legend}>
                        <span>In transit: {fleetUtilization.inTransit}</span>
                        <span>Docked: {fleetUtilization.docked}</span>
                        <span>In orbit: {fleetUtilization.orbit}</span>
                        <span>Other: {fleetUtilization.other}</span>
                    </div>
                </>
            ) : (
                <p className={styles.emptyState}>No ships discovered yet.</p>
            )}
        </Card>
    );
};

export default FleetUtilization;
