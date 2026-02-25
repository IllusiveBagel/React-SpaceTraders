import { useState } from "react";

import ShipNavigation from "components/Ship/ShipNavigation";
import Mining from "components/Ship/Mining";

import { useZustandShip } from "hooks/fleet/useZustandShip";

import styles from "./Controls.module.css";
import FlightMode from "../FlightMode";
import SellCargo from "../SellCargo";
import Container from "components/Common/Container";
import type { Survey } from "types/survey";
import type { Mount } from "types/fleet";

const Controls = ({ shipSymbol }: { shipSymbol: string }) => {
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [survey, setSurvey] = useState<Survey | null>(null);

    const ship = useZustandShip(shipSymbol);
    if (!ship) {
        return <div className={styles.controls}>Loading ship data...</div>;
    }
    const hasMiningMount = Boolean(
        ship.mounts.some(
            (mount: Mount) =>
                mount.symbol.toUpperCase().includes("MINING") ||
                mount.name.toUpperCase().includes("MINING"),
        ),
    );

    const handleAction = async (
        action: () => Promise<unknown>,
        message: string,
    ) => {
        setActionError(null);
        setActionMessage(null);

        try {
            await action();
            setActionMessage(message);
        } catch (err) {
            setActionError(
                err instanceof Error ? err.message : "Action failed.",
            );
        }
    };

    return (
        <Container className={styles.controls}>
            <div className={styles.controlsHeader}>
                <div>
                    <h2 className={styles.controlsTitle}>Manual controls</h2>
                    <p className={styles.controlsSubtitle}>
                        Orbit, extract, and sell on demand.
                    </p>
                </div>
                <div className={styles.controlsStatus}>
                    {actionError && (
                        <span className={styles.controlsError}>
                            {actionError}
                        </span>
                    )}
                    {actionMessage && (
                        <span className={styles.controlsMessage}>
                            {actionMessage}
                        </span>
                    )}
                </div>
            </div>

            <div className={styles.controlsGrid}>
                <ShipNavigation
                    ship={ship}
                    shipSymbol={shipSymbol}
                    setActionError={setActionError}
                    handleAction={handleAction}
                />
                {hasMiningMount && (
                    <Mining
                        ship={ship}
                        shipSymbol={shipSymbol}
                        handleAction={handleAction}
                        surveys={surveys}
                        setSurveys={setSurveys}
                        survey={survey}
                        setSurvey={setSurvey}
                    />
                )}
                <FlightMode
                    ship={ship}
                    shipSymbol={shipSymbol}
                    handleAction={handleAction}
                    setActionError={setActionError}
                    setActionMessage={setActionMessage}
                />
                <SellCargo
                    ship={ship}
                    shipSymbol={shipSymbol}
                    handleAction={handleAction}
                    setActionError={setActionError}
                />
            </div>
        </Container>
    );
};

export default Controls;
