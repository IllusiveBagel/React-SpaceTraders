import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { formatDuration } from "helpers/fleetFormatters";

import useShipsWithStore from "hooks/Ship/useShipsWithStore";
import useTransitProgress from "hooks/useTransitProgress";

import Container from "components/Common/Container";
import ProgressBar from "components/Common/ProgressBar";
import ShipDetails from "components/Ship/ShipDetails";
import ShipControls from "components/Ship/ShipControls";
import ShipModules from "components/Ship/ShipModules";
import ShipMounts from "components/Ship/ShipMounts";
import ShipCargo from "components/Ship/ShipCargo";

import type { Ship } from "types/Ship";

import styles from "./Ship.module.css";

type ShipTab = "info" | "controls" | "modules" | "mounts" | "cargo";

const getStatusClass = (status: string) => {
    return status === "IN_TRANSIT" ? styles.statusTransit : styles.statusDocked;
};

const ShipPage = () => {
    const { shipSymbol } = useParams();
    const { ships, isLoading, error } = useShipsWithStore();
    const ship = ships.find((s: Ship) => s.symbol === shipSymbol);
    const transit = useTransitProgress(ship);

    const [activeTab, setActiveTab] = useState<ShipTab>("info");

    const tabs: { label: string; value: ShipTab }[] = [
        { label: "Ship Info", value: "info" },
        { label: "Controls", value: "controls" },
        { label: "Modules", value: "modules" },
        { label: "Mounts", value: "mounts" },
        { label: "Cargo", value: "cargo" },
    ];

    if (isLoading) {
        return <div>Loading ship...</div>;
    }

    if (error) {
        return <div>Error loading ship: {error.message}</div>;
    }

    if (!ship) {
        return <div>Ship not found.</div>;
    }

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

            <div className={styles.stats}>
                <div>
                    <p className={styles.statLabel}>Role</p>
                    <p className={styles.statValue}>{ship.registration.role}</p>
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
                                {formatDuration(transit.remainingSeconds)}
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
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        className={`${styles.tab} ${tab.value === activeTab ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab(tab.value)}
                        role="tab"
                        aria-controls={`ship-tab-${tab.value}`}
                        aria-selected={tab.value === activeTab}
                        id={`ship-tab-${tab.value}-button`}
                    >
                        {tab.label}
                    </button>
                ))}
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
                        <ShipControls ship={ship} />
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
                        <ShipCargo ship={ship} />
                    </div>
                )}
            </div>
        </Container>
    );
};

export default ShipPage;
