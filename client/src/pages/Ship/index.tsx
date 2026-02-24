import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ShipDetails from "components/Fleet/ShipDetails";
import DetailField from "components/Fleet/DetailField";
import useGetShip from "hooks/fleet/useGetShip";
import useShipActions from "hooks/fleet/useShipActions";
import useTransitProgress from "hooks/fleet/useTransitProgress";
import useGetMiningWaypoints from "hooks/systems/useGetMiningWaypoints";
import useGetSystem from "hooks/systems/useGetSystem";
import ProgressBar from "components/Home/ProgressBar";
import { usePageTitle } from "components/Layout/PageTitleContext";
import {
    displayValue,
    formatDuration,
    formatRequirements,
} from "helpers/fleetFormatters";

import styles from "./Ship.module.css";

type ShipTab = "info" | "controls" | "modules" | "mounts" | "cargo";

const getStatusClass = (status: string) => {
    return status === "IN_TRANSIT" ? styles.statusTransit : styles.statusDocked;
};

const Ship = () => {
    const { shipSymbol } = useParams();
    const { data: ship, isLoading, error } = useGetShip(shipSymbol);
    const {
        orbit,
        dock,
        navigate,
        extract,
        refuel,
        sell,
        jettison,
        setFlightMode,
        isWorking,
    } = useShipActions(shipSymbol);
    const transit = useTransitProgress(ship);
    const { data: system } = useGetSystem(ship?.nav.systemSymbol);
    const { data: miningWaypoints = [] } = useGetMiningWaypoints(
        ship?.nav.systemSymbol,
    );
    const [activeTab, setActiveTab] = useState<ShipTab>("info");
    const [navigateTarget, setNavigateTarget] = useState("");
    const [sellSymbol, setSellSymbol] = useState("");
    const [sellUnits, setSellUnits] = useState("");
    const [refuelFromCargo, setRefuelFromCargo] = useState(false);
    const [flightMode, setFlightModeValue] = useState("");
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const cargoPercent = ship
        ? ship.cargo.capacity > 0
            ? Math.min(
                  100,
                  Math.round((ship.cargo.units / ship.cargo.capacity) * 100),
              )
            : 0
        : 0;

    const cargoSymbols = useMemo(() => {
        if (!ship) {
            return [] as string[];
        }

        return ship.cargo.inventory.map((item) => item.symbol);
    }, [ship]);
    const defaultSellSymbol = useMemo(
        () => cargoSymbols[0] ?? "",
        [cargoSymbols],
    );
    const sellSymbolValue = sellSymbol || defaultSellSymbol;
    const fuelCargoUnits = useMemo(() => {
        if (!ship) {
            return 0;
        }

        return (
            ship.cargo.inventory.find((item) => item.symbol === "FUEL")
                ?.units ?? 0
        );
    }, [ship]);
    const hasFuelCargo = fuelCargoUnits > 0;
    const hasCargo = ship ? ship.cargo.units > 0 : false;
    const isInOrbit = ship?.nav.status === "IN_ORBIT";
    const isDocked = ship?.nav.status === "DOCKED";
    const canRefuel = Boolean(isDocked || hasFuelCargo);
    const hasMiningMount = Boolean(
        ship?.mounts.some(
            (mount) =>
                mount.symbol.toUpperCase().includes("MINING") ||
                mount.name.toUpperCase().includes("MINING"),
        ),
    );
    const isAtMiningWaypoint = Boolean(
        isInOrbit &&
        ship?.nav.waypointSymbol &&
        miningWaypoints.some(
            (waypoint) => waypoint.symbol === ship.nav.waypointSymbol,
        ),
    );
    const isOnCooldown = Boolean(ship && ship.cooldown.remainingSeconds > 0);
    const flightModeOptions = useMemo(() => {
        const baseModes = ["CRUISE", "DRIFT", "STEALTH", "BURN"];
        const currentMode = ship?.nav.flightMode;
        if (currentMode && !baseModes.includes(currentMode)) {
            return [currentMode, ...baseModes];
        }

        return baseModes;
    }, [ship?.nav.flightMode]);
    const flightModeValue = flightMode || ship?.nav.flightMode || "";
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

    useEffect(() => {
        if (!hasFuelCargo && refuelFromCargo) {
            setRefuelFromCargo(false);
        }
    }, [hasFuelCargo, refuelFromCargo]);

    useEffect(() => {
        if (ship?.nav.flightMode) {
            setFlightModeValue(ship.nav.flightMode);
        }
    }, [ship?.nav.flightMode]);

    useEffect(() => {
        if (ship?.nav.waypointSymbol && !navigateTarget) {
            setNavigateTarget(ship.nav.waypointSymbol);
        }
    }, [ship?.nav.waypointSymbol, navigateTarget]);

    usePageTitle(ship?.registration.name ?? "Ship");

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

    const handleSell = async () => {
        if (!ship) {
            return;
        }

        const trimmedSymbol = sellSymbolValue.trim();
        if (!trimmedSymbol) {
            setActionError("Enter a cargo symbol to sell.");
            return;
        }

        const matchingUnits =
            ship.cargo.inventory.find((item) => item.symbol === trimmedSymbol)
                ?.units ?? 0;
        const requestedUnits = sellUnits.trim()
            ? Number(sellUnits)
            : matchingUnits;

        if (!requestedUnits || Number.isNaN(requestedUnits)) {
            setActionError("Enter a valid unit count to sell.");
            return;
        }

        await handleAction(
            () => sell({ symbol: trimmedSymbol, units: requestedUnits }),
            `Selling ${requestedUnits} ${trimmedSymbol}.`,
        );
    };

    const handleJettison = async () => {
        if (!ship) {
            return;
        }

        const trimmedSymbol = sellSymbolValue.trim();
        if (!trimmedSymbol) {
            setActionError("Select cargo to jettison.");
            return;
        }

        const matchingUnits =
            ship.cargo.inventory.find((item) => item.symbol === trimmedSymbol)
                ?.units ?? 0;
        const requestedUnits = sellUnits.trim()
            ? Number(sellUnits)
            : matchingUnits;

        if (!requestedUnits || Number.isNaN(requestedUnits)) {
            setActionError("Enter a valid unit count to jettison.");
            return;
        }

        await handleAction(
            () => jettison({ symbol: trimmedSymbol, units: requestedUnits }),
            `Jettisoned ${requestedUnits} ${trimmedSymbol}.`,
        );
    };

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
        <section className={styles.ship}>
            <div className={styles.header}>
                <div>
                    <p className={styles.breadcrumb}>
                        <Link to="/fleet">Fleet</Link>
                        {shipSymbol ? ` / ${shipSymbol}` : ""}
                    </p>
                </div>
                {ship?.nav.status && (
                    <span
                        className={`${styles.status} ${getStatusClass(
                            ship.nav.status,
                        )}`}
                    >
                        {ship.nav.status}
                    </span>
                )}
            </div>

            {isLoading && <p>Loading...</p>}
            {error && <p>Error loading ship.</p>}

            {ship && (
                <>
                    <div className={styles.stats}>
                        <div>
                            <p className={styles.statLabel}>Role</p>
                            <p className={styles.statValue}>
                                {ship.registration.role}
                            </p>
                        </div>
                        <div>
                            <p className={styles.statLabel}>System</p>
                            <p className={styles.statValue}>
                                <Link
                                    to={`/systems/${ship.nav.systemSymbol}`}
                                    className={styles.link}
                                >
                                    {ship.nav.systemSymbol}
                                </Link>
                            </p>
                        </div>
                        <div>
                            <p className={styles.statLabel}>Waypoint</p>
                            <p className={styles.statValue}>
                                {ship.nav.waypointSymbol}
                            </p>
                        </div>
                        <div>
                            <p className={styles.statLabel}>Fuel</p>
                            <p className={styles.statValue}>
                                {ship.fuel.current}/{ship.fuel.capacity}
                            </p>
                        </div>
                        <div>
                            <p className={styles.statLabel}>Cargo</p>
                            <p className={styles.statValue}>
                                {ship.cargo.units}/{ship.cargo.capacity}
                            </p>
                        </div>
                        <div>
                            <p className={styles.statLabel}>Crew</p>
                            <p className={styles.statValue}>
                                {ship.crew.current}/{ship.crew.required}/
                                {ship.crew.capacity}
                            </p>
                        </div>
                        <div>
                            <p className={styles.statLabel}>Cooldown</p>
                            <p className={styles.statValue}>
                                {ship.cooldown.remainingSeconds > 0
                                    ? `${ship.cooldown.remainingSeconds}s`
                                    : "Ready"}
                            </p>
                        </div>
                    </div>

                    {transit.isInTransit && (
                        <section className={styles.transitPanel}>
                            <div className={styles.transitHeader}>
                                <div>
                                    <h2 className={styles.transitTitle}>
                                        Transit progress
                                    </h2>
                                    <p className={styles.transitSubtitle}>
                                        Arriving in{" "}
                                        {formatDuration(
                                            transit.remainingSeconds,
                                        )}
                                    </p>
                                </div>
                                {transit.arrivalTime && (
                                    <span className={styles.transitEta}>
                                        ETA {transit.arrivalTime}
                                    </span>
                                )}
                            </div>
                            <ProgressBar
                                current={transit.elapsedSeconds}
                                total={transit.totalSeconds}
                            />
                        </section>
                    )}

                    <div className={styles.tabs} role="tablist">
                        <button
                            type="button"
                            className={`${styles.tab} ${
                                activeTab === "info" ? styles.tabActive : ""
                            }`}
                            onClick={() => setActiveTab("info")}
                            role="tab"
                            aria-selected={activeTab === "info"}
                            aria-controls="ship-tab-info"
                            id="ship-tab-info-button"
                        >
                            Ship info
                        </button>
                        <button
                            type="button"
                            className={`${styles.tab} ${
                                activeTab === "controls" ? styles.tabActive : ""
                            }`}
                            onClick={() => setActiveTab("controls")}
                            role="tab"
                            aria-selected={activeTab === "controls"}
                            aria-controls="ship-tab-controls"
                            id="ship-tab-controls-button"
                        >
                            Controls
                        </button>
                        <button
                            type="button"
                            className={`${styles.tab} ${
                                activeTab === "modules" ? styles.tabActive : ""
                            }`}
                            onClick={() => setActiveTab("modules")}
                            role="tab"
                            aria-selected={activeTab === "modules"}
                            aria-controls="ship-tab-modules"
                            id="ship-tab-modules-button"
                        >
                            Modules
                        </button>
                        <button
                            type="button"
                            className={`${styles.tab} ${
                                activeTab === "mounts" ? styles.tabActive : ""
                            }`}
                            onClick={() => setActiveTab("mounts")}
                            role="tab"
                            aria-selected={activeTab === "mounts"}
                            aria-controls="ship-tab-mounts"
                            id="ship-tab-mounts-button"
                        >
                            Mounts
                        </button>
                        <button
                            type="button"
                            className={`${styles.tab} ${
                                activeTab === "cargo" ? styles.tabActive : ""
                            }`}
                            onClick={() => setActiveTab("cargo")}
                            role="tab"
                            aria-selected={activeTab === "cargo"}
                            aria-controls="ship-tab-cargo"
                            id="ship-tab-cargo-button"
                        >
                            Cargo
                        </button>
                    </div>

                    <div className={styles.details}>
                        {activeTab === "info" && (
                            <div
                                id="ship-tab-info"
                                role="tabpanel"
                                aria-labelledby="ship-tab-info-button"
                            >
                                <ShipDetails ship={ship} />
                            </div>
                        )}

                        {activeTab === "controls" && (
                            <div
                                id="ship-tab-controls"
                                role="tabpanel"
                                aria-labelledby="ship-tab-controls-button"
                            >
                                <section className={styles.controls}>
                                    <div className={styles.controlsHeader}>
                                        <div>
                                            <h2
                                                className={styles.controlsTitle}
                                            >
                                                Manual controls
                                            </h2>
                                            <p
                                                className={
                                                    styles.controlsSubtitle
                                                }
                                            >
                                                Orbit, extract, and sell on
                                                demand.
                                            </p>
                                        </div>
                                        <div className={styles.controlsStatus}>
                                            {actionError && (
                                                <span
                                                    className={
                                                        styles.controlsError
                                                    }
                                                >
                                                    {actionError}
                                                </span>
                                            )}
                                            {actionMessage && (
                                                <span
                                                    className={
                                                        styles.controlsMessage
                                                    }
                                                >
                                                    {actionMessage}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.controlsGrid}>
                                        <div className={styles.controlCard}>
                                            <p className={styles.controlTitle}>
                                                Navigation
                                            </p>
                                            <div className={styles.controlRow}>
                                                <select
                                                    value={navigateTarget}
                                                    onChange={(event) =>
                                                        setNavigateTarget(
                                                            event.target.value,
                                                        )
                                                    }
                                                    disabled={
                                                        isWorking ||
                                                        navigateOptions.length ===
                                                            0 ||
                                                        !isInOrbit
                                                    }
                                                >
                                                    {navigateOptions.length ===
                                                    0 ? (
                                                        <option value="">
                                                            No waypoints found
                                                        </option>
                                                    ) : (
                                                        navigateOptions.map(
                                                            (waypoint) => (
                                                                <option
                                                                    key={
                                                                        waypoint.symbol
                                                                    }
                                                                    value={
                                                                        waypoint.symbol
                                                                    }
                                                                >
                                                                    {
                                                                        waypoint.symbol
                                                                    }
                                                                </option>
                                                            ),
                                                        )
                                                    )}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={handleNavigate}
                                                    disabled={
                                                        isWorking ||
                                                        !navigateTarget ||
                                                        !isInOrbit
                                                    }
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
                                                        handleAction(
                                                            () => orbit(),
                                                            "Orbiting ship.",
                                                        )
                                                    }
                                                    disabled={isWorking}
                                                >
                                                    Orbit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleAction(
                                                            () => dock(),
                                                            "Docking ship.",
                                                        )
                                                    }
                                                    disabled={isWorking}
                                                >
                                                    Dock
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleAction(
                                                            () =>
                                                                refuel(
                                                                    refuelFromCargo,
                                                                ),
                                                            refuelFromCargo
                                                                ? "Refueling ship from cargo."
                                                                : "Refueling ship.",
                                                        )
                                                    }
                                                    disabled={
                                                        isWorking || !canRefuel
                                                    }
                                                >
                                                    Refuel
                                                </button>
                                                <label
                                                    className={
                                                        styles.controlToggle
                                                    }
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            refuelFromCargo
                                                        }
                                                        onChange={(event) =>
                                                            setRefuelFromCargo(
                                                                event.target
                                                                    .checked,
                                                            )
                                                        }
                                                        disabled={
                                                            isWorking ||
                                                            !hasFuelCargo
                                                        }
                                                    />
                                                    <span
                                                        className={
                                                            styles.controlToggleLabel
                                                        }
                                                    >
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
                                        </div>

                                        {hasMiningMount && (
                                            <div className={styles.controlCard}>
                                                <p
                                                    className={
                                                        styles.controlTitle
                                                    }
                                                >
                                                    Mining
                                                </p>
                                                <div
                                                    className={
                                                        styles.controlRow
                                                    }
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleAction(
                                                                () => extract(),
                                                                "Extracting resources.",
                                                            )
                                                        }
                                                        disabled={
                                                            isWorking ||
                                                            !isAtMiningWaypoint ||
                                                            isOnCooldown
                                                        }
                                                    >
                                                        Extract
                                                    </button>
                                                </div>
                                                <p
                                                    className={
                                                        styles.controlHint
                                                    }
                                                >
                                                    {!isAtMiningWaypoint
                                                        ? "Must be in orbit at a minable waypoint."
                                                        : isOnCooldown
                                                          ? `Cooldown: ${ship.cooldown.remainingSeconds}s`
                                                          : "Ready to extract."}
                                                </p>
                                            </div>
                                        )}

                                        <div className={styles.controlCard}>
                                            <p className={styles.controlTitle}>
                                                Flight mode
                                            </p>
                                            <div className={styles.controlRow}>
                                                <select
                                                    value={flightModeValue}
                                                    onChange={(event) =>
                                                        setFlightModeValue(
                                                            event.target.value,
                                                        )
                                                    }
                                                >
                                                    {flightModeOptions.map(
                                                        (mode) => (
                                                            <option
                                                                key={mode}
                                                                value={mode}
                                                            >
                                                                {mode}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={handleFlightMode}
                                                    disabled={
                                                        isWorking ||
                                                        !flightModeValue
                                                    }
                                                >
                                                    Set mode
                                                </button>
                                            </div>
                                            <p className={styles.controlHint}>
                                                Current: {ship.nav.flightMode}
                                            </p>
                                        </div>

                                        <div className={styles.controlCard}>
                                            <p className={styles.controlTitle}>
                                                Sell cargo
                                            </p>
                                            <div className={styles.controlRow}>
                                                <select
                                                    value={sellSymbolValue}
                                                    onChange={(event) =>
                                                        setSellSymbol(
                                                            event.target.value,
                                                        )
                                                    }
                                                    disabled={
                                                        isWorking || !hasCargo
                                                    }
                                                >
                                                    {!hasCargo ? (
                                                        <option value="">
                                                            No cargo available
                                                        </option>
                                                    ) : (
                                                        cargoSymbols.map(
                                                            (symbol) => (
                                                                <option
                                                                    key={symbol}
                                                                    value={
                                                                        symbol
                                                                    }
                                                                >
                                                                    {symbol}
                                                                </option>
                                                            ),
                                                        )
                                                    )}
                                                </select>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={sellUnits}
                                                    onChange={(event) =>
                                                        setSellUnits(
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Units"
                                                />
                                            </div>
                                            <div className={styles.controlRow}>
                                                <button
                                                    type="button"
                                                    onClick={handleSell}
                                                    disabled={
                                                        isWorking || !hasCargo
                                                    }
                                                >
                                                    Sell
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleJettison}
                                                    disabled={
                                                        isWorking || !hasCargo
                                                    }
                                                >
                                                    Jettison
                                                </button>
                                                <span
                                                    className={
                                                        styles.controlHint
                                                    }
                                                >
                                                    {ship.cargo.units}/
                                                    {ship.cargo.capacity} units
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === "modules" && (
                            <div
                                id="ship-tab-modules"
                                role="tabpanel"
                                aria-labelledby="ship-tab-modules-button"
                            >
                                {ship.modules.length > 0 ? (
                                    <div className={styles.cardsGrid}>
                                        {ship.modules.map((module) => (
                                            <div
                                                className={styles.infoCard}
                                                key={`${ship.symbol}-${module.symbol}`}
                                            >
                                                <div>
                                                    <h3
                                                        className={
                                                            styles.cardTitle
                                                        }
                                                    >
                                                        {module.name}
                                                    </h3>
                                                    <p
                                                        className={
                                                            styles.cardMeta
                                                        }
                                                    >
                                                        {module.symbol}
                                                    </p>
                                                </div>
                                                <DetailField
                                                    label="Capacity"
                                                    value={displayValue(
                                                        module.capacity,
                                                    )}
                                                />
                                                <DetailField
                                                    label="Range"
                                                    value={displayValue(
                                                        module.range,
                                                    )}
                                                />
                                                <DetailField
                                                    label="Requirements"
                                                    value={formatRequirements(
                                                        module.requirements,
                                                    )}
                                                />
                                                <p
                                                    className={
                                                        styles.detailText
                                                    }
                                                >
                                                    {module.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={styles.detailText}>
                                        No modules installed.
                                    </p>
                                )}
                            </div>
                        )}

                        {activeTab === "mounts" && (
                            <div
                                id="ship-tab-mounts"
                                role="tabpanel"
                                aria-labelledby="ship-tab-mounts-button"
                            >
                                {ship.mounts.length > 0 ? (
                                    <div className={styles.cardsGrid}>
                                        {ship.mounts.map((mount) => (
                                            <div
                                                className={styles.infoCard}
                                                key={`${ship.symbol}-${mount.symbol}`}
                                            >
                                                <div>
                                                    <h3
                                                        className={
                                                            styles.cardTitle
                                                        }
                                                    >
                                                        {mount.name}
                                                    </h3>
                                                    <p
                                                        className={
                                                            styles.cardMeta
                                                        }
                                                    >
                                                        {mount.symbol}
                                                    </p>
                                                </div>
                                                <DetailField
                                                    label="Strength"
                                                    value={mount.strength}
                                                />
                                                <DetailField
                                                    label="Deposits"
                                                    value={
                                                        (mount.deposits
                                                            ?.length ?? 0) > 0
                                                            ? (mount.deposits?.join(
                                                                  ", ",
                                                              ) ?? "None")
                                                            : "None"
                                                    }
                                                />
                                                <DetailField
                                                    label="Requirements"
                                                    value={formatRequirements(
                                                        mount.requirements,
                                                    )}
                                                />
                                                <p
                                                    className={
                                                        styles.detailText
                                                    }
                                                >
                                                    {mount.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={styles.detailText}>
                                        No mounts installed.
                                    </p>
                                )}
                            </div>
                        )}

                        {activeTab === "cargo" && (
                            <div
                                id="ship-tab-cargo"
                                role="tabpanel"
                                aria-labelledby="ship-tab-cargo-button"
                            >
                                <div className={styles.cargoPanel}>
                                    <div className={styles.cargoHeader}>
                                        <div>
                                            <p className={styles.cargoTitle}>
                                                Cargo capacity
                                            </p>
                                            <p className={styles.cargoNumbers}>
                                                {ship.cargo.units}/
                                                {ship.cargo.capacity} units •{" "}
                                                {cargoPercent}% used
                                            </p>
                                        </div>
                                        <div className={styles.cargoBar}>
                                            <div
                                                className={styles.cargoFill}
                                                style={{
                                                    width: `${cargoPercent}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {ship.cargo.inventory.length > 0 ? (
                                        <div
                                            className={styles.cargoTableWrapper}
                                        >
                                            <table
                                                className={styles.cargoTable}
                                            >
                                                <thead>
                                                    <tr>
                                                        <th>Item</th>
                                                        <th>Units</th>
                                                        <th>Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {ship.cargo.inventory.map(
                                                        (item) => (
                                                            <tr
                                                                key={`${ship.symbol}-${item.symbol}`}
                                                            >
                                                                <td
                                                                    className={
                                                                        styles.cargoItem
                                                                    }
                                                                >
                                                                    {item.name}
                                                                </td>
                                                                <td>
                                                                    {item.units}
                                                                </td>
                                                                <td
                                                                    className={
                                                                        styles.cargoDesc
                                                                    }
                                                                >
                                                                    {item.description ||
                                                                        "No description"}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className={styles.detailText}>
                                            Cargo bay is empty.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </section>
    );
};

export default Ship;
