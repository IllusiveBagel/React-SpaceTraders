import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { formatDuration, formatRequirements } from "helpers/fleetFormatters";

import useGetShip from "hooks/fleet/useGetShip";
import useTransitProgress from "hooks/fleet/useTransitProgress";

import { usePageTitle } from "components/Layout/PageTitleContext";
import Container from "components/Common/Container";
import ProgressBar from "components/Common/ProgressBar";
import ShipDetails from "components/Ship/ShipDetails";
import DetailField from "components/Ship/DetailField";

import styles from "./Ship.module.css";
import Controls from "components/Ship/Controls";
import ShipModules from "components/Ship/Modules";
import ShipMounts from "components/Ship/Mounts";

type ShipTab = "info" | "controls" | "modules" | "mounts" | "cargo";

const getStatusClass = (status: string) => {
    return status === "IN_TRANSIT" ? styles.statusTransit : styles.statusDocked;
};

const Ship = () => {
    const { shipSymbol } = useParams();
    const { data: ship, isLoading, error } = useGetShip(shipSymbol);
    const transit = useTransitProgress(ship);

    const [activeTab, setActiveTab] = useState<ShipTab>("info");

    const cargoPercent = ship
        ? ship.cargo.capacity > 0
            ? Math.min(
                  100,
                  Math.round((ship.cargo.units / ship.cargo.capacity) * 100),
              )
            : 0
        : 0;

    usePageTitle(ship?.registration.name ?? "Ship");

    return (
        <Container>
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
                                <Controls
                                    shipSymbol={ship.symbol}
                                    ship={ship}
                                />
                            </div>
                        )}

                        {activeTab === "modules" && (
                            <div
                                id="ship-tab-modules"
                                role="tabpanel"
                                aria-labelledby="ship-tab-modules-button"
                            >
                                <ShipModules ship={ship} />
                            </div>
                        )}

                        {activeTab === "mounts" && (
                            <div
                                id="ship-tab-mounts"
                                role="tabpanel"
                                aria-labelledby="ship-tab-mounts-button"
                            >
                                <ShipMounts ship={ship} />
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
        </Container>
    );
};

export default Ship;
