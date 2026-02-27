import { useEffect, useMemo, useState } from "react";

import { useMutateShip } from "hooks/Ship";
import useCooldownProgress from "hooks/useCooldownProgress";

import Card from "components/Common/Card";
import Container from "components/Common/Container";

import type { Ship } from "types/Ship";

import styles from "./ShipControls.module.css";
import type { Produce } from "types/Common";
import type { Waypoint } from "types/Waypoint";
import { useWaypointsWithStore } from "hooks/Systems";

const PRODUCE_OPTIONS: Produce[] = [
    "IRON",
    "COPPER",
    "SILVER",
    "GOLD",
    "ALUMINUM",
    "PLATINUM",
    "URANITE",
    "MERITIUM",
    "FUEL",
];

const ShipControls = ({ ship }: { ship: Ship }) => {
    const { waypoints: systemWaypoints } = useWaypointsWithStore(
        ship?.nav.systemSymbol,
    );
    const [flightMode, setFlightMode] = useState("");
    const [refineSymbol, setRefineSymbol] = useState<Produce>("" as Produce);
    const [isCoolingDown, setIsCoolingDown] = useState(false);
    const [navigateTarget, setNavigateTarget] = useState("");
    const { patchShipNav, extractResources, shipRefine, navigateShip } =
        useMutateShip(ship?.symbol);
    const { remainingSeconds, refetchCooldown } = useCooldownProgress(
        ship?.symbol,
    );

    useEffect(() => {
        setIsCoolingDown(remainingSeconds > 0);
    }, [remainingSeconds]);

    useEffect(() => {
        if (ship?.nav.flightMode) {
            setFlightMode(ship.nav.flightMode);
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

    const selectedWaypoint = useMemo(() => {
        return (
            systemWaypoints.find(
                (waypoint: Waypoint) => waypoint.symbol === navigateTarget,
            ) ?? null
        );
    }, [navigateTarget, systemWaypoints]);

    return (
        <Container className={styles.controls}>
            <Card title="Navigation Controls" cardLight>
                <p className={styles.controlLabel}>
                    Flight Mode: {ship?.nav.flightMode}
                </p>
                <div className={styles.controlRow}>
                    <select
                        value={flightMode}
                        onChange={(event) => setFlightMode(event.target.value)}
                    >
                        {flightModeOptions.map((mode) => (
                            <option key={mode} value={mode}>
                                {mode}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => {
                            patchShipNav.mutate(flightMode);
                        }}
                        disabled={patchShipNav.isPending || !flightMode}
                    >
                        Set mode
                    </button>
                </div>
                <p className={styles.controlLabel}>Navigate:</p>
                <div className={styles.controlRow}>
                    <input
                        type="text"
                        value={navigateTarget}
                        onChange={(e) => setNavigateTarget(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => {
                            navigateShip.mutate(navigateTarget);
                        }}
                    >
                        Navigate
                    </button>
                </div>
                <p className={styles.controlHint}>
                    {ship?.nav.status !== "IN_ORBIT"
                        ? "You must be in orbit to navigate."
                        : selectedWaypoint
                          ? `Type: ${selectedWaypoint.type} • Coords: ${selectedWaypoint.x}, ${selectedWaypoint.y}`
                          : "Choose a destination in the current system."}
                </p>
            </Card>
            <Card title="Mining Controls" cardLight>
                <p className={styles.controlLabel}>Extract Resources</p>
                <div className={styles.controlRow}>
                    <button
                        type="button"
                        onClick={() => {
                            extractResources.mutate(undefined, {
                                onSuccess: () => {
                                    refetchCooldown();
                                },
                            });
                        }}
                        disabled={
                            extractResources.isPending ||
                            ship?.nav.status !== "IN_ORBIT" ||
                            isCoolingDown
                        }
                    >
                        Extract
                    </button>
                    <p className={styles.controlHint}>
                        {isCoolingDown
                            ? `Cooldown: ${remainingSeconds}s remaining`
                            : "Ready to extract"}
                    </p>
                </div>
            </Card>
            <Card title="Refinement Controls" cardLight>
                <p className={styles.controlLabel}>Refine Resources</p>
                <div className={styles.controlRow}>
                    <select
                        value={refineSymbol}
                        onChange={(e) =>
                            setRefineSymbol(e.target.value as Produce)
                        }
                    >
                        {PRODUCE_OPTIONS.map((item: Produce) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => {
                            shipRefine.mutate(refineSymbol, {
                                onSuccess: () => {
                                    refetchCooldown();
                                },
                            });
                        }}
                        disabled={
                            shipRefine.isPending ||
                            isCoolingDown ||
                            ship.cargo.inventory.length === 0
                        }
                    >
                        Refine
                    </button>
                    <p className={styles.controlHint}>
                        {isCoolingDown
                            ? `Cooldown: ${remainingSeconds}s remaining`
                            : "Ready to refine"}
                    </p>
                </div>
            </Card>
        </Container>
    );
};

export default ShipControls;
