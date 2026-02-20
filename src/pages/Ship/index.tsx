import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ShipDetails from "components/Fleet/ShipDetails";
import DetailField from "components/Fleet/DetailField";
import useGetShip from "hooks/fleet/useGetShip";
import useShipActions from "hooks/fleet/useShipActions";
import useTransitProgress from "hooks/fleet/useTransitProgress";
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
    const { orbit, dock, navigate, extract, refuel, sell, isWorking } =
        useShipActions(shipSymbol);
    const transit = useTransitProgress(ship);
    const [activeTab, setActiveTab] = useState<ShipTab>("info");
    const [navigateTarget, setNavigateTarget] = useState("");
    const [sellSymbol, setSellSymbol] = useState("");
    const [sellUnits, setSellUnits] = useState("");
    const [refuelFromCargo, setRefuelFromCargo] = useState(false);
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

    useEffect(() => {
        if (!hasFuelCargo && refuelFromCargo) {
            setRefuelFromCargo(false);
        }
    }, [hasFuelCargo, refuelFromCargo]);

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
            setActionError("Enter a waypoint symbol to navigate.");
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
                                                <input
                                                    value={navigateTarget}
                                                    onChange={(event) =>
                                                        setNavigateTarget(
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Waypoint symbol"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleNavigate}
                                                    disabled={isWorking}
                                                >
                                                    Navigate
                                                </button>
                                            </div>
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
                                                    disabled={isWorking}
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
                                                    Use cargo fuel
                                                </label>
                                            </div>
                                            <p className={styles.controlHint}>
                                                {hasFuelCargo
                                                    ? `Cargo fuel: ${fuelCargoUnits} units`
                                                    : "No fuel in cargo"}
                                            </p>
                                        </div>

                                        <div className={styles.controlCard}>
                                            <p className={styles.controlTitle}>
                                                Mining
                                            </p>
                                            <div className={styles.controlRow}>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleAction(
                                                            () => extract(),
                                                            "Extracting resources.",
                                                        )
                                                    }
                                                    disabled={isWorking}
                                                >
                                                    Extract
                                                </button>
                                            </div>
                                            <p className={styles.controlHint}>
                                                Cooldown:{" "}
                                                {ship.cooldown.remainingSeconds}
                                                s
                                            </p>
                                        </div>

                                        <div className={styles.controlCard}>
                                            <p className={styles.controlTitle}>
                                                Sell cargo
                                            </p>
                                            <div className={styles.controlRow}>
                                                <input
                                                    list="cargo-symbols"
                                                    value={sellSymbolValue}
                                                    onChange={(event) =>
                                                        setSellSymbol(
                                                            event.target.value.toUpperCase(),
                                                        )
                                                    }
                                                    placeholder="Cargo symbol"
                                                />
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
                                                    disabled={isWorking}
                                                >
                                                    Sell
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
                                            <datalist id="cargo-symbols">
                                                {cargoSymbols.map((symbol) => (
                                                    <option
                                                        key={symbol}
                                                        value={symbol}
                                                    />
                                                ))}
                                            </datalist>
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
