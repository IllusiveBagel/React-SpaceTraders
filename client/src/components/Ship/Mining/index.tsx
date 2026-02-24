import useShipActions from "hooks/fleet/useShipActions";
import useGetMiningWaypoints from "hooks/systems/useGetMiningWaypoints";

import Card from "components/Common/Card";

import type { Ship } from "types/fleet";

import styles from "./Mining.module.css";

type MiningProps = {
    ship: Ship;
    shipSymbol: string;
    handleAction: (
        action: () => Promise<unknown>,
        message: string,
    ) => Promise<void>;
};

const Mining = ({ ship, shipSymbol, handleAction }: MiningProps) => {
    const { extract, isWorking } = useShipActions(shipSymbol);

    const { data: miningWaypoints = [] } = useGetMiningWaypoints(
        ship?.nav.systemSymbol,
    );

    const isInOrbit = ship?.nav.status === "IN_ORBIT";

    const isAtMiningWaypoint = Boolean(
        isInOrbit &&
        ship?.nav.waypointSymbol &&
        miningWaypoints.some(
            (waypoint) => waypoint.symbol === ship.nav.waypointSymbol,
        ),
    );

    const isOnCooldown = Boolean(ship && ship.cooldown.remainingSeconds > 0);

    return (
        <Card title="Mining" cardLight>
            <div className={styles.controlRow}>
                <button
                    type="button"
                    onClick={() =>
                        handleAction(() => extract(), "Extracting resources.")
                    }
                    disabled={isWorking || !isAtMiningWaypoint || isOnCooldown}
                >
                    Extract
                </button>
            </div>
            <p className={styles.controlHint}>
                {!isAtMiningWaypoint
                    ? "Must be in orbit at a minable waypoint."
                    : isOnCooldown
                      ? `Cooldown: ${ship.cooldown.remainingSeconds}s`
                      : "Ready to extract."}
            </p>
        </Card>
    );
};

export default Mining;
