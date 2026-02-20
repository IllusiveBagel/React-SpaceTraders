import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import useGetSystem from "hooks/systems/useGetSystem";
import useGetMiningWaypoints from "hooks/systems/useGetMiningWaypoints";
import useGetMarketWaypoints from "hooks/systems/useGetMarketWaypoints";
import useGetShipyardWaypoints from "hooks/systems/useGetShipyardWaypoints";
import { usePageTitle } from "components/Layout/PageTitleContext";

import styles from "./System.module.css";

type SystemTab = "waypoints" | "markets" | "shipyards" | "mining" | "factions";

const getTraitClass = (symbol: string) => {
    const normalized = symbol.toUpperCase();

    if (normalized.includes("METAL") || normalized.includes("MINERAL")) {
        return styles.traitMetal;
    }

    if (normalized.includes("GAS") || normalized.includes("ICE")) {
        return styles.traitGas;
    }

    if (normalized.includes("CRATER")) {
        return styles.traitCrater;
    }

    if (
        normalized.includes("RADIOACTIVE") ||
        normalized.includes("UNSTABLE") ||
        normalized.includes("EXPLOSIVE") ||
        normalized.includes("HOLLOWED")
    ) {
        return styles.traitHazard;
    }

    if (normalized.includes("MARKET") || normalized.includes("TRADING")) {
        return styles.traitMarket;
    }

    if (normalized.includes("SHIPYARD")) {
        return styles.traitShipyard;
    }

    if (normalized.includes("ENGINEERED") || normalized.includes("STRIPPED")) {
        return styles.traitStructure;
    }

    return styles.traitOther;
};

const System = () => {
    const { systemSymbol } = useParams();
    const { data: system, isLoading, error } = useGetSystem(systemSymbol);
    const {
        data: miningWaypoints,
        isLoading: miningLoading,
        error: miningError,
    } = useGetMiningWaypoints(systemSymbol);
    const {
        data: marketWaypoints,
        isLoading: marketLoading,
        error: marketError,
    } = useGetMarketWaypoints(systemSymbol);
    const {
        data: shipyardWaypoints,
        isLoading: shipyardLoading,
        error: shipyardError,
    } = useGetShipyardWaypoints(systemSymbol);
    const [activeTab, setActiveTab] = useState<SystemTab>("waypoints");
    const systemRouteSymbol = system?.symbol ?? systemSymbol ?? "";

    usePageTitle(system?.name ?? "System");

    return (
        <div className={styles.system}>
            <div className={styles.header}>
                <div>
                    <p className={styles.breadcrumb}>
                        <Link to="/systems">Systems</Link>
                        {systemSymbol ? ` / ${systemSymbol}` : ""}
                    </p>
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

                    <div className={styles.tabs} role="tablist">
                        <button
                            type="button"
                            className={`${styles.tab} ${
                                activeTab === "waypoints"
                                    ? styles.tabActive
                                    : ""
                            }`}
                            onClick={() => setActiveTab("waypoints")}
                            role="tab"
                            aria-selected={activeTab === "waypoints"}
                            aria-controls="system-tab-waypoints"
                            id="system-tab-waypoints-button"
                        >
                            Waypoints
                        </button>
                        <button
                            type="button"
                            className={`${styles.tab} ${
                                activeTab === "mining" ? styles.tabActive : ""
                            }`}
                            onClick={() => setActiveTab("mining")}
                            role="tab"
                            aria-selected={activeTab === "mining"}
                            aria-controls="system-tab-mining"
                            id="system-tab-mining-button"
                        >
                            Mining
                        </button>
                        <button
                            type="button"
                            className={`${styles.tab} ${
                                activeTab === "markets" ? styles.tabActive : ""
                            }`}
                            onClick={() => setActiveTab("markets")}
                            role="tab"
                            aria-selected={activeTab === "markets"}
                            aria-controls="system-tab-markets"
                            id="system-tab-markets-button"
                        >
                            Markets
                        </button>
                        <button
                            type="button"
                            className={`${styles.tab} ${
                                activeTab === "shipyards"
                                    ? styles.tabActive
                                    : ""
                            }`}
                            onClick={() => setActiveTab("shipyards")}
                            role="tab"
                            aria-selected={activeTab === "shipyards"}
                            aria-controls="system-tab-shipyards"
                            id="system-tab-shipyards-button"
                        >
                            Shipyards
                        </button>
                        <button
                            type="button"
                            className={`${styles.tab} ${
                                activeTab === "factions" ? styles.tabActive : ""
                            }`}
                            onClick={() => setActiveTab("factions")}
                            role="tab"
                            aria-selected={activeTab === "factions"}
                            aria-controls="system-tab-factions"
                            id="system-tab-factions-button"
                        >
                            Factions
                        </button>
                    </div>

                    <div className={styles.details}>
                        {activeTab === "waypoints" && (
                            <section
                                id="system-tab-waypoints"
                                role="tabpanel"
                                aria-labelledby="system-tab-waypoints-button"
                                className={styles.section}
                            >
                                {system.waypoints.length === 0 ? (
                                    <p className={styles.emptyState}>
                                        No waypoints found for this system.
                                    </p>
                                ) : (
                                    <div className={styles.grid}>
                                        {system.waypoints.map((waypoint) => (
                                            <Link
                                                key={waypoint.symbol}
                                                to={`/systems/${systemRouteSymbol}/waypoints/${waypoint.symbol}`}
                                                className={`${styles.card} ${styles.cardLink}`}
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
                                                    <p
                                                        className={
                                                            styles.cardMeta
                                                        }
                                                    >
                                                        Orbits:{" "}
                                                        {waypoint.orbits}
                                                    </p>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === "mining" && (
                            <section
                                id="system-tab-mining"
                                role="tabpanel"
                                aria-labelledby="system-tab-mining-button"
                                className={styles.section}
                            >
                                {miningLoading && (
                                    <p>Loading mining sites...</p>
                                )}
                                {miningError && (
                                    <p className={styles.emptyState}>
                                        Error loading mining sites.
                                    </p>
                                )}
                                {!miningLoading &&
                                    !miningError &&
                                    (miningWaypoints?.length ?? 0) === 0 && (
                                        <p className={styles.emptyState}>
                                            No mining sites found in this
                                            system.
                                        </p>
                                    )}
                                {(miningWaypoints?.length ?? 0) > 0 && (
                                    <div className={styles.grid}>
                                        {miningWaypoints?.map((waypoint) => (
                                            <Link
                                                key={waypoint.symbol}
                                                to={`/systems/${systemRouteSymbol}/waypoints/${waypoint.symbol}`}
                                                className={`${styles.card} ${styles.cardLink}`}
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
                                                {waypoint.traits &&
                                                    waypoint.traits.length >
                                                        0 && (
                                                        <div
                                                            className={
                                                                styles.traitList
                                                            }
                                                        >
                                                            {waypoint.traits.map(
                                                                (trait) => (
                                                                    <span
                                                                        key={
                                                                            trait.symbol
                                                                        }
                                                                        className={`${
                                                                            styles.traitTag
                                                                        } ${getTraitClass(
                                                                            trait.symbol,
                                                                        )}`}
                                                                    >
                                                                        {
                                                                            trait.symbol
                                                                        }
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === "markets" && (
                            <section
                                id="system-tab-markets"
                                role="tabpanel"
                                aria-labelledby="system-tab-markets-button"
                                className={styles.section}
                            >
                                {marketLoading && (
                                    <p>Loading market waypoints...</p>
                                )}
                                {marketError && (
                                    <p className={styles.emptyState}>
                                        Error loading market waypoints.
                                    </p>
                                )}
                                {!marketLoading &&
                                    !marketError &&
                                    (marketWaypoints?.length ?? 0) === 0 && (
                                        <p className={styles.emptyState}>
                                            No market waypoints found in this
                                            system.
                                        </p>
                                    )}
                                {(marketWaypoints?.length ?? 0) > 0 && (
                                    <div className={styles.grid}>
                                        {marketWaypoints?.map((waypoint) => (
                                            <Link
                                                key={waypoint.symbol}
                                                to={`/systems/${systemRouteSymbol}/waypoints/${waypoint.symbol}`}
                                                className={`${styles.card} ${styles.cardLink}`}
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
                                                {waypoint.traits &&
                                                    waypoint.traits.length >
                                                        0 && (
                                                        <div
                                                            className={
                                                                styles.traitList
                                                            }
                                                        >
                                                            {waypoint.traits.map(
                                                                (trait) => (
                                                                    <span
                                                                        key={
                                                                            trait.symbol
                                                                        }
                                                                        className={`${
                                                                            styles.traitTag
                                                                        } ${getTraitClass(
                                                                            trait.symbol,
                                                                        )}`}
                                                                    >
                                                                        {
                                                                            trait.symbol
                                                                        }
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === "shipyards" && (
                            <section
                                id="system-tab-shipyards"
                                role="tabpanel"
                                aria-labelledby="system-tab-shipyards-button"
                                className={styles.section}
                            >
                                {shipyardLoading && (
                                    <p>Loading shipyard waypoints...</p>
                                )}
                                {shipyardError && (
                                    <p className={styles.emptyState}>
                                        Error loading shipyard waypoints.
                                    </p>
                                )}
                                {!shipyardLoading &&
                                    !shipyardError &&
                                    (shipyardWaypoints?.length ?? 0) === 0 && (
                                        <p className={styles.emptyState}>
                                            No shipyard waypoints found in this
                                            system.
                                        </p>
                                    )}
                                {(shipyardWaypoints?.length ?? 0) > 0 && (
                                    <div className={styles.grid}>
                                        {shipyardWaypoints?.map((waypoint) => (
                                            <Link
                                                key={waypoint.symbol}
                                                to={`/systems/${systemRouteSymbol}/waypoints/${waypoint.symbol}`}
                                                className={`${styles.card} ${styles.cardLink}`}
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
                                                {waypoint.traits &&
                                                    waypoint.traits.length >
                                                        0 && (
                                                        <div
                                                            className={
                                                                styles.traitList
                                                            }
                                                        >
                                                            {waypoint.traits.map(
                                                                (trait) => (
                                                                    <span
                                                                        key={
                                                                            trait.symbol
                                                                        }
                                                                        className={`${
                                                                            styles.traitTag
                                                                        } ${getTraitClass(
                                                                            trait.symbol,
                                                                        )}`}
                                                                    >
                                                                        {
                                                                            trait.symbol
                                                                        }
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === "factions" && (
                            <section
                                id="system-tab-factions"
                                role="tabpanel"
                                aria-labelledby="system-tab-factions-button"
                                className={styles.section}
                            >
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
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default System;
