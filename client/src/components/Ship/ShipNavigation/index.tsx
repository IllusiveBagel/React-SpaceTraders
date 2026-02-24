import { useEffect, useMemo, useState } from "react";

import useGetSystem from "hooks/systems/useGetSystem";
import useShipActions from "hooks/fleet/useShipActions";

import Card from "components/Common/Card";

import styles from "./ShipNavigation.module.css";

type ShipNavigationProps = {
    ship: any;
    setActionError: (error: string) => void;
    handleAction: (
        action: () => Promise<unknown>,
        message: string,
    ) => Promise<void>;
    shipSymbol: string;
};

const ShipNavigation = ({
    ship,
    shipSymbol,
    setActionError,
    handleAction,
}: ShipNavigationProps) => {
    const { orbit, dock, navigate, refuel, isWorking } =
        useShipActions(shipSymbol);

    const [refuelFromCargo, setRefuelFromCargo] = useState(false);
    const [navigateTarget, setNavigateTarget] = useState("");

    const isInOrbit = ship?.nav.status === "IN_ORBIT";

    const fuelCargoUnits = useMemo(() => {
        if (!ship) {
            return 0;
        }

        return (
            ship.cargo.inventory.find(
                (item: { symbol: string; units: number }) =>
                    item.symbol === "FUEL",
            )?.units ?? 0
        );
    }, [ship]);
    const hasFuelCargo = fuelCargoUnits > 0;

    useEffect(() => {
        if (!hasFuelCargo && refuelFromCargo) {
            setRefuelFromCargo(false);
        }
    }, [hasFuelCargo, refuelFromCargo]);

    useEffect(() => {
        if (ship?.nav.waypointSymbol && !navigateTarget) {
            setNavigateTarget(ship.nav.waypointSymbol);
        }
    }, [ship?.nav.waypointSymbol, navigateTarget]);

    const { data: system } = useGetSystem(ship?.nav.systemSymbol);

    const isDocked = ship?.nav.status === "DOCKED";

    const canRefuel = Boolean(isDocked || hasFuelCargo);

    const systemWaypoints = useMemo(() => {
        if (!system?.waypoints) {
            return [] as {
                symbol: string;
                type: string;
                x: number;
                y: number;
            }[];
        }

        return [...system.waypoints].sort((a, b) =>
            a.symbol.localeCompare(b.symbol),
        );
    }, [system?.waypoints]);

    const navigateOptions = useMemo(() => {
        const currentSymbol = ship?.nav.waypointSymbol;
        if (!currentSymbol) {
            return systemWaypoints;
        }

        const hasCurrent = systemWaypoints.some(
            (waypoint) => waypoint.symbol === currentSymbol,
        );
        if (hasCurrent) {
            return systemWaypoints;
        }

        return [
            {
                symbol: currentSymbol,
                type: "CURRENT",
                x: 0,
                y: 0,
            },
            ...systemWaypoints,
        ];
    }, [ship?.nav.waypointSymbol, systemWaypoints]);

    const selectedWaypoint = useMemo(() => {
        return (
            systemWaypoints.find(
                (waypoint) => waypoint.symbol === navigateTarget,
            ) ?? null
        );
    }, [navigateTarget, systemWaypoints]);

    const handleNavigate = async () => {
        if (!navigateTarget.trim()) {
            setActionError("Select a waypoint to navigate.");
            return;
        }

        await handleAction(
            () => navigate(navigateTarget.trim()),
            `Navigating to ${navigateTarget.trim()}.`,
        );
    };

    return (
        <Card title="Navigation" cardLight>
            <div className={styles.controlRow}>
                <select
                    value={navigateTarget}
                    onChange={(event) => setNavigateTarget(event.target.value)}
                    disabled={
                        isWorking || navigateOptions.length === 0 || !isInOrbit
                    }
                >
                    {navigateOptions.length === 0 ? (
                        <option value="">No waypoints found</option>
                    ) : (
                        navigateOptions.map((waypoint) => (
                            <option
                                key={waypoint.symbol}
                                value={waypoint.symbol}
                            >
                                {waypoint.symbol}
                            </option>
                        ))
                    )}
                </select>
                <button
                    type="button"
                    onClick={handleNavigate}
                    disabled={isWorking || !navigateTarget || !isInOrbit}
                >
                    Navigate
                </button>
            </div>
            <p className={styles.controlHint}>
                {!isInOrbit
                    ? "You must be in orbit to navigate."
                    : selectedWaypoint
                      ? `Type: ${selectedWaypoint.type} • Coords: ${selectedWaypoint.x}, ${selectedWaypoint.y}`
                      : "Choose a destination in the current system."}
            </p>
            <div className={styles.controlRow}>
                <button
                    type="button"
                    onClick={() =>
                        handleAction(() => orbit(), "Orbiting ship.")
                    }
                    disabled={isWorking}
                >
                    Orbit
                </button>
                <button
                    type="button"
                    onClick={() => handleAction(() => dock(), "Docking ship.")}
                    disabled={isWorking}
                >
                    Dock
                </button>
                <button
                    type="button"
                    onClick={() =>
                        handleAction(
                            () => refuel(refuelFromCargo),
                            refuelFromCargo
                                ? "Refueling ship from cargo."
                                : "Refueling ship.",
                        )
                    }
                    disabled={isWorking || !canRefuel}
                >
                    Refuel
                </button>
                <label className={styles.controlToggle}>
                    <input
                        type="checkbox"
                        checked={refuelFromCargo}
                        onChange={(event) =>
                            setRefuelFromCargo(event.target.checked)
                        }
                        disabled={isWorking || !hasFuelCargo}
                    />
                    <span className={styles.controlToggleLabel}>
                        Use cargo fuel
                    </span>
                </label>
            </div>
            <p className={styles.controlHint}>
                {canRefuel
                    ? hasFuelCargo
                        ? `Cargo fuel: ${fuelCargoUnits} units`
                        : "Docked: station refuel available"
                    : "Refuel requires docking or cargo fuel."}
            </p>
        </Card>
    );
};

export default ShipNavigation;
