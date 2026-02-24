import { useState } from "react";

import ShipNavigation from "components/Ship/ShipNavigation";
import Mining from "components/Ship/Mining";

import type { Ship } from "types/fleet";

import styles from "./Controls.module.css";
import FlightMode from "../FlightMode";
import SellCargo from "../SellCargo";

const Controls = ({ shipSymbol, ship }: { shipSymbol: string; ship: Ship }) => {
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const hasMiningMount = Boolean(
        ship?.mounts.some(
            (mount) =>
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
        <div
            id="ship-tab-controls"
            role="tabpanel"
            aria-labelledby="ship-tab-controls-button"
        >
            <section className={styles.controls}>
                <div className={styles.controlsHeader}>
                    <div>
                        <h2 className={styles.controlsTitle}>
                            Manual controls
                        </h2>
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
            </section>
        </div>
    );
};

export default Controls;
