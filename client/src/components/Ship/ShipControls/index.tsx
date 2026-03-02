import { useEffect, useMemo, useState } from "react";

import { useMutateShip } from "hooks/Ship";
import useCooldownProgress from "hooks/useCooldownProgress";
import { useSystemWithStore } from "hooks/Systems";

import Card from "components/Common/Card";
import Container from "components/Common/Container";

import type { Ship } from "types/Ship";

import styles from "./ShipControls.module.css";
import type { Produce } from "types/Common";
import type { Waypoint } from "types/Waypoint";

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
    const [flightMode, setFlightMode] = useState("");
    const [refineSymbol, setRefineSymbol] = useState<Produce>("" as Produce);
    const [isCoolingDown, setIsCoolingDown] = useState(false);
    const [navigateTarget, setNavigateTarget] = useState("");
    const {
        patchShipNav,
        extractResources,
        shipRefine,
        navigateShip,
        dockShip,
        orbitShip,
    } = useMutateShip(ship?.symbol);
    const { remainingSeconds, refetchCooldown } = useCooldownProgress(
        ship?.symbol,
    );
    const { system, isLoading, error } = useSystemWithStore(
        ship?.nav.systemSymbol,
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

    const waypoints = system?.waypoints ?? [];

    const selectedWaypoint = useMemo(() => {
        return (
            waypoints.find(
                (waypoint: Waypoint) => waypoint.symbol === navigateTarget,
            ) ?? null
        );
    }, [navigateTarget, waypoints]);

    if (isLoading) {
        return (
            <Container className={styles.controls}>
                <p>Loading system data...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className={styles.controls}>
                <p>Error loading system data: {error.message}</p>
            </Container>
        );
    }

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
                    <select
                        value={navigateTarget}
                        onChange={(event) =>
                            setNavigateTarget(event.target.value)
                        }
                    >
                        <option value="">Select destination</option>
                        {waypoints.map((waypoint: Waypoint) => (
                            <option
                                key={waypoint.symbol}
                                value={waypoint.symbol}
                            >
                                {waypoint.symbol}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => {
                            navigateShip.mutate(navigateTarget);
                        }}
                        disabled={
                            navigateShip.isPending ||
                            ship?.nav.status !== "IN_ORBIT" ||
                            !navigateTarget
                        }
                    >
                        Navigate
                    </button>
                </div>
                <p className={styles.controlHint}>
                    {ship?.nav.status === "IN_ORBIT"
                        ? selectedWaypoint
                            ? `Type: ${selectedWaypoint.type} • Coords: ${selectedWaypoint.x}, ${selectedWaypoint.y}`
                            : "Choose a destination in the current system."
                        : "You must be in orbit to navigate."}
                </p>
                <div className={styles.controlRow}>
                    <button
                        type="button"
                        onClick={() => {
                            if (ship?.nav.status === "IN_ORBIT") {
                                dockShip.mutate();
                            } else if (ship?.nav.status === "DOCKED") {
                                orbitShip.mutate();
                            }
                        }}
                        disabled={
                            dockShip.isPending ||
                            orbitShip.isPending ||
                            ship?.nav.status === "IN_TRANSIT"
                        }
                    >
                        {ship?.nav.status === "IN_ORBIT" ? "Dock" : "Orbit"}
                    </button>
                </div>
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
