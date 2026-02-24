import { Link, useParams } from "react-router-dom";

import useGetWaypoint from "hooks/systems/useGetWaypoint";
import { usePageTitle } from "components/Layout/PageTitleContext";

import styles from "./Waypoint.module.css";

const Waypoint = () => {
    const { systemSymbol, waypointSymbol } = useParams();
    const {
        data: waypoint,
        isLoading,
        error,
    } = useGetWaypoint(systemSymbol, waypointSymbol);

    usePageTitle(waypoint?.symbol ?? waypointSymbol ?? "Waypoint");

    const orbitals = waypoint?.orbitals ?? [];
    const traits = waypoint?.traits ?? [];
    const modifiers = waypoint?.modifiers ?? [];
    const systemRouteSymbol = systemSymbol ?? waypoint?.systemSymbol ?? "";

    return (
        <div className={styles.waypoint}>
            <div className={styles.header}>
                <div>
                    <p className={styles.breadcrumb}>
                        <Link to="/systems">Systems</Link>
                        {systemRouteSymbol && (
                            <>
                                {" "}
                                /{" "}
                                <Link to={`/systems/${systemRouteSymbol}`}>
                                    {systemRouteSymbol}
                                </Link>
                            </>
                        )}
                        {waypointSymbol ? ` / ${waypointSymbol}` : ""}
                    </p>
                    <p className={styles.symbol}>
                        {waypoint?.symbol ?? waypointSymbol}
                    </p>
                </div>
                {waypoint?.type && (
                    <span className={styles.type}>{waypoint.type}</span>
                )}
            </div>

            {isLoading && <p>Loading waypoint...</p>}
            {error && <p>Error loading waypoint.</p>}

            {waypoint && (
                <>
                    <div className={styles.stats}>
                        <div>
                            <p className={styles.statLabel}>System</p>
                            <p className={styles.statValue}>
                                {waypoint.systemSymbol}
                            </p>
                        </div>
                        <div>
                            <p className={styles.statLabel}>Coordinates</p>
                            <p className={styles.statValue}>
                                {waypoint.x}, {waypoint.y}
                            </p>
                        </div>
                        <div>
                            <p className={styles.statLabel}>Orbitals</p>
                            <p className={styles.statValue}>
                                {orbitals.length}
                            </p>
                        </div>
                        <div>
                            <p className={styles.statLabel}>Orbits</p>
                            <p className={styles.statValue}>
                                {waypoint.orbits ?? "None"}
                            </p>
                        </div>
                        <div>
                            <p className={styles.statLabel}>
                                Under construction
                            </p>
                            <p className={styles.statValue}>
                                {waypoint.isUnderConstruction ? "Yes" : "No"}
                            </p>
                        </div>
                        <div>
                            <p className={styles.statLabel}>Faction</p>
                            <p className={styles.statValue}>
                                {waypoint.faction?.symbol ?? "None"}
                            </p>
                        </div>
                    </div>

                    <div className={styles.details}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Traits</h2>
                            {traits.length === 0 ? (
                                <p className={styles.emptyState}>
                                    No traits reported for this waypoint.
                                </p>
                            ) : (
                                <div className={styles.list}>
                                    {traits.map((trait) => (
                                        <div
                                            key={trait.symbol}
                                            className={styles.listItem}
                                        >
                                            <div>
                                                <p className={styles.itemTitle}>
                                                    {trait.symbol}
                                                </p>
                                                <p
                                                    className={
                                                        styles.itemSubtitle
                                                    }
                                                >
                                                    {trait.name}
                                                </p>
                                            </div>
                                            <p
                                                className={
                                                    styles.itemDescription
                                                }
                                            >
                                                {trait.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Modifiers</h2>
                            {modifiers.length === 0 ? (
                                <p className={styles.emptyState}>
                                    No modifiers reported for this waypoint.
                                </p>
                            ) : (
                                <div className={styles.list}>
                                    {modifiers.map((modifier) => (
                                        <div
                                            key={modifier.symbol}
                                            className={styles.listItem}
                                        >
                                            <div>
                                                <p className={styles.itemTitle}>
                                                    {modifier.symbol}
                                                </p>
                                                <p
                                                    className={
                                                        styles.itemSubtitle
                                                    }
                                                >
                                                    {modifier.name}
                                                </p>
                                            </div>
                                            <p
                                                className={
                                                    styles.itemDescription
                                                }
                                            >
                                                {modifier.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Orbitals</h2>
                            {orbitals.length === 0 ? (
                                <p className={styles.emptyState}>
                                    No orbitals reported for this waypoint.
                                </p>
                            ) : (
                                <div className={styles.listCompact}>
                                    {orbitals.map((orbital) => (
                                        <span
                                            key={orbital.symbol}
                                            className={styles.tag}
                                        >
                                            {orbital.symbol}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Chart</h2>
                            {waypoint.chart ? (
                                <div className={styles.chart}>
                                    <div>
                                        <p className={styles.statLabel}>
                                            Submitted by
                                        </p>
                                        <p className={styles.statValue}>
                                            {waypoint.chart.submittedBy}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={styles.statLabel}>
                                            Submitted on
                                        </p>
                                        <p className={styles.statValue}>
                                            {waypoint.chart.submittedOn}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className={styles.emptyState}>
                                    No chart data reported for this waypoint.
                                </p>
                            )}
                        </section>
                    </div>
                </>
            )}
        </div>
    );
};

export default Waypoint;
