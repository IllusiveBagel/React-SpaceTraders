import { Link, useParams } from "react-router-dom";

import useGetSystem from "hooks/systems/useGetSystem";

import styles from "./System.module.css";

const System = () => {
    const { systemSymbol } = useParams();
    const { data: system, isLoading, error } = useGetSystem(systemSymbol);

    return (
        <div className={styles.system}>
            <div className={styles.header}>
                <div>
                    <p className={styles.breadcrumb}>
                        <Link to="/systems">Systems</Link>
                        {systemSymbol ? ` / ${systemSymbol}` : ""}
                    </p>
                    <h1 className={styles.title}>{system?.name ?? "System"}</h1>
                    {system?.symbol && (
                        <p className={styles.symbol}>{system.symbol}</p>
                    )}
                </div>
                {system?.type && (
                    <span className={styles.type}>{system.type}</span>
                )}
            </div>

            {isLoading && <p>Loading...</p>}
            {error && <p>Error loading system.</p>}

            {system && (
                <>
                    <div className={styles.stats}>
                        <div>
                            <p className={styles.statLabel}>Sector</p>
                            <p className={styles.statValue}>
                                {system.sectorSymbol}
                            </p>
                        </div>
                        <div>
                            <p className={styles.statLabel}>Constellation</p>
                            <p className={styles.statValue}>
                                {system.constellation}
                            </p>
                        </div>
                        <div>
                            <p className={styles.statLabel}>Coordinates</p>
                            <p className={styles.statValue}>
                                {system.x}, {system.y}
                            </p>
                        </div>
                        <div>
                            <p className={styles.statLabel}>Waypoints</p>
                            <p className={styles.statValue}>
                                {system.waypoints.length}
                            </p>
                        </div>
                        <div>
                            <p className={styles.statLabel}>Factions</p>
                            <p className={styles.statValue}>
                                {system.factions.length}
                            </p>
                        </div>
                    </div>

                    <div className={styles.sections}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Factions</h2>
                            {system.factions.length === 0 ? (
                                <p className={styles.emptyState}>
                                    No factions listed for this system.
                                </p>
                            ) : (
                                <div className={styles.factions}>
                                    {system.factions.map((faction) => (
                                        <span
                                            key={faction.symbol}
                                            className={styles.faction}
                                        >
                                            {faction.symbol}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </section>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Waypoints</h2>
                            {system.waypoints.length === 0 ? (
                                <p className={styles.emptyState}>
                                    No waypoints found for this system.
                                </p>
                            ) : (
                                <div className={styles.grid}>
                                    {system.waypoints.map((waypoint) => (
                                        <div
                                            key={waypoint.symbol}
                                            className={styles.card}
                                        >
                                            <p className={styles.cardTitle}>
                                                {waypoint.symbol}
                                            </p>
                                            <p className={styles.cardMeta}>
                                                {waypoint.type}
                                            </p>
                                            <p className={styles.cardMeta}>
                                                Coordinates: {waypoint.x},{" "}
                                                {waypoint.y}
                                            </p>
                                            <p className={styles.cardMeta}>
                                                Orbitals:{" "}
                                                {waypoint.orbitals.length}
                                            </p>
                                            {waypoint.orbits && (
                                                <p className={styles.cardMeta}>
                                                    Orbits: {waypoint.orbits}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </>
            )}
        </div>
    );
};

export default System;
