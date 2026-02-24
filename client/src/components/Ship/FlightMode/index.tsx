import { useEffect, useMemo, useState } from "react";

import useShipActions from "hooks/fleet/useShipActions";

import Card from "components/Common/Card";

import type { Ship } from "types/fleet";

import styles from "./FlightMode.module.css";

type FlightModeProps = {
    ship: Ship;
    shipSymbol: string;
    handleAction: (
        action: () => Promise<unknown>,
        message: string,
    ) => Promise<void>;
    setActionError: (message: string | null) => void;
    setActionMessage: (message: string | null) => void;
};

const FlightMode = ({
    ship,
    shipSymbol,
    handleAction,
    setActionError,
    setActionMessage,
}: FlightModeProps) => {
    const { setFlightMode, isWorking } = useShipActions(shipSymbol);

    const [flightMode, setFlightModeValue] = useState("");

    useEffect(() => {
        if (ship?.nav.flightMode) {
            setFlightModeValue(ship.nav.flightMode);
        }
    }, [ship?.nav.flightMode]);

    const flightModeOptions = useMemo(() => {
        const baseModes = ["CRUISE", "DRIFT", "STEALTH", "BURN"];
        const currentMode = ship?.nav.flightMode;
        if (currentMode && !baseModes.includes(currentMode)) {
            return [currentMode, ...baseModes];
        }

        return baseModes;
    }, [ship?.nav.flightMode]);

    const flightModeValue = flightMode || ship?.nav.flightMode || "";

    const handleFlightMode = async () => {
        if (!ship) {
            return;
        }

        const trimmedMode = flightModeValue.trim().toUpperCase();
        if (!trimmedMode) {
            setActionError("Select a flight mode.");
            return;
        }

        if (trimmedMode === ship.nav.flightMode) {
            setActionError(null);
            setActionMessage(`Flight mode already ${trimmedMode}.`);
            return;
        }

        await handleAction(
            () => setFlightMode(trimmedMode),
            `Flight mode set to ${trimmedMode}.`,
        );
    };

    return (
        <Card title="Flight mode" cardLight>
            <div className={styles.controlRow}>
                <select
                    value={flightModeValue}
                    onChange={(event) => setFlightModeValue(event.target.value)}
                >
                    {flightModeOptions.map((mode) => (
                        <option key={mode} value={mode}>
                            {mode}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={handleFlightMode}
                    disabled={isWorking || !flightModeValue}
                >
                    Set mode
                </button>
            </div>
            <p className={styles.controlHint}>Current: {ship.nav.flightMode}</p>
        </Card>
    );
};

export default FlightMode;
