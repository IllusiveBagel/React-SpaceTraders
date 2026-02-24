import { useEffect, useMemo, useState } from "react";

import useGetShips from "hooks/fleet/useGetShips";
import useGetShipyard from "hooks/shipyard/useGetShipyard";
import useShipyardActions from "hooks/shipyard/useShipyardActions";
import { usePageTitle } from "components/Layout/PageTitleContext";

import styles from "./Shipyard.module.css";

const Shipyard = () => {
    usePageTitle("Shipyard");

    const { data: ships, isLoading, error } = useGetShips();
    const [selectedShipSymbol, setSelectedShipSymbol] = useState("");
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [expandedShipKey, setExpandedShipKey] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedShipSymbol && ships && ships.length > 0) {
            setSelectedShipSymbol(ships[0].symbol);
        }
    }, [selectedShipSymbol, ships]);

    const selectedShip = useMemo(() => {
        if (!ships || !selectedShipSymbol) {
            return undefined;
        }

        return ships.find((ship) => ship.symbol === selectedShipSymbol);
    }, [ships, selectedShipSymbol]);

    const systemSymbol = selectedShip?.nav.systemSymbol;
    const waypointSymbol = selectedShip?.nav.waypointSymbol;

    useEffect(() => {
        setExpandedShipKey(null);
    }, [waypointSymbol]);

    const {
        data: shipyard,
        isLoading: shipyardLoading,
        error: shipyardError,
    } = useGetShipyard(systemSymbol, waypointSymbol);
    const { purchase, isPurchasing } = useShipyardActions(
        systemSymbol,
        waypointSymbol,
    );

    const shipTypesCount = shipyard?.shipTypes?.length ?? 0;
    const availableShips = shipyard?.ships ?? [];
    const transactionsCount = shipyard?.transactions?.length ?? 0;
    const hasShipyard = shipyard !== null && shipyard !== undefined;

    const formatList = (items?: { symbol: string; name?: string }[]) => {
        if (!items || items.length === 0) {
            return "None";
        }

        return items
            .map((item) =>
                item.name ? `${item.name} (${item.symbol})` : item.symbol,
            )
            .join(", ");
    };

    const getShipKey = (shipType: string, name?: string) =>
        `${shipType}-${name ?? ""}`;

    const handlePurchase = async (shipType: string) => {
        setActionError(null);
        setActionMessage(null);

        try {
            await purchase(shipType);
            setActionMessage(`Purchased ${shipType}.`);
        } catch (err) {
            setActionError(
                err instanceof Error ? err.message : "Purchase failed.",
            );
        }
    };

    return (
        <section className={styles.shipyard}>
            <header className={styles.header}>
                <div>
                    <p className={styles.subtitle}>
                        View ships for sale at a ship&#39;s current waypoint.
                    </p>
                </div>
                <div className={styles.selector}>
                    <label className={styles.label} htmlFor="shipyard-ship">
                        Ship
                    </label>
                    <select
                        id="shipyard-ship"
                        className={styles.select}
                        value={selectedShipSymbol}
                        onChange={(event) =>
                            setSelectedShipSymbol(event.target.value)
                        }
                        disabled={isLoading || (ships?.length ?? 0) === 0}
                    >
                        {(ships ?? []).map((ship) => (
                            <option key={ship.symbol} value={ship.symbol}>
                                {ship.registration.name} ({ship.symbol})
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            {isLoading && <p className={styles.state}>Loading ships...</p>}
            {error && (
                <p className={styles.error}>
                    Error loading ships: {error.message}
                </p>
            )}

            {!isLoading && !error && !selectedShip && (
                <p className={styles.state}>No ships available.</p>
            )}

            {selectedShip && (
                <div className={styles.meta}>
                    <div>
                        <p className={styles.metaLabel}>System</p>
                        <p className={styles.metaValue}>
                            {selectedShip.nav.systemSymbol}
                        </p>
                    </div>
                    <div>
                        <p className={styles.metaLabel}>Waypoint</p>
                        <p className={styles.metaValue}>
                            {selectedShip.nav.waypointSymbol}
                        </p>
                    </div>
                    <div>
                        <p className={styles.metaLabel}>Status</p>
                        <p className={styles.metaValue}>
                            {selectedShip.nav.status}
                        </p>
                    </div>
                </div>
            )}

            {shipyardLoading && (
                <p className={styles.state}>Loading shipyard data...</p>
            )}
            {shipyardError && (
                <p className={styles.error}>
                    Error loading shipyard: {shipyardError.message}
                </p>
            )}
            {actionError && <p className={styles.error}>{actionError}</p>}
            {actionMessage && <p className={styles.state}>{actionMessage}</p>}

            {!shipyardLoading &&
                !shipyardError &&
                selectedShip &&
                shipyard === null && (
                    <p className={styles.state}>
                        No shipyard available at this waypoint.
                    </p>
                )}

            {!shipyardLoading &&
                !shipyardError &&
                selectedShip &&
                hasShipyard && (
                    <div className={styles.content}>
                        <div className={styles.summary}>
                            <div className={styles.summaryCard}>
                                <p className={styles.summaryLabel}>
                                    Ship types
                                </p>
                                <p className={styles.summaryValue}>
                                    {shipTypesCount}
                                </p>
                            </div>
                            <div className={styles.summaryCard}>
                                <p className={styles.summaryLabel}>
                                    Ships for sale
                                </p>
                                <p className={styles.summaryValue}>
                                    {availableShips.length}
                                </p>
                            </div>
                            <div className={styles.summaryCard}>
                                <p className={styles.summaryLabel}>
                                    Recent transactions
                                </p>
                                <p className={styles.summaryValue}>
                                    {transactionsCount}
                                </p>
                            </div>
                        </div>

                        {availableShips.length === 0 ? (
                            <p className={styles.state}>
                                No ships listed for this shipyard.
                            </p>
                        ) : (
                            <div className={styles.table}>
                                <div className={styles.tableHeader}>
                                    <span>Name</span>
                                    <span>Type</span>
                                    <span>Price</span>
                                    <span>Frame</span>
                                    <span>Engine</span>
                                    <span>Crew</span>
                                    <span></span>
                                </div>
                                {availableShips.map((ship) => (
                                    <div
                                        key={getShipKey(ship.type, ship.name)}
                                        className={styles.tableGroup}
                                    >
                                        <div
                                            className={styles.tableRow}
                                            role="button"
                                            tabIndex={0}
                                            aria-expanded={
                                                expandedShipKey ===
                                                getShipKey(ship.type, ship.name)
                                            }
                                            onClick={() => {
                                                const shipKey = getShipKey(
                                                    ship.type,
                                                    ship.name,
                                                );
                                                setExpandedShipKey((current) =>
                                                    current === shipKey
                                                        ? null
                                                        : shipKey,
                                                );
                                            }}
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === "Enter" ||
                                                    event.key === " "
                                                ) {
                                                    event.preventDefault();
                                                    const shipKey = getShipKey(
                                                        ship.type,
                                                        ship.name,
                                                    );
                                                    setExpandedShipKey(
                                                        (current) =>
                                                            current === shipKey
                                                                ? null
                                                                : shipKey,
                                                    );
                                                }
                                            }}
                                        >
                                            <span
                                                className={styles.tablePrimary}
                                            >
                                                {ship.name ?? ship.type}
                                            </span>
                                            <span>{ship.type}</span>
                                            <span>
                                                {ship.purchasePrice ?? "-"}
                                            </span>
                                            <span>
                                                {ship.frame?.name ?? "-"}
                                            </span>
                                            <span>
                                                {ship.engine?.name ?? "-"}
                                            </span>
                                            <span>
                                                {ship.crew?.required
                                                    ? `${ship.crew.required}/${ship.crew.capacity ?? "-"}`
                                                    : "-"}
                                            </span>
                                            <span className={styles.actionCell}>
                                                <button
                                                    type="button"
                                                    className={
                                                        styles.purchaseButton
                                                    }
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handlePurchase(
                                                            ship.type,
                                                        );
                                                    }}
                                                    disabled={
                                                        isPurchasing ||
                                                        shipyardLoading
                                                    }
                                                >
                                                    {isPurchasing
                                                        ? "Purchasing..."
                                                        : "Buy"}
                                                </button>
                                            </span>
                                        </div>
                                        {expandedShipKey ===
                                            getShipKey(
                                                ship.type,
                                                ship.name,
                                            ) && (
                                            <div className={styles.detailsRow}>
                                                <div
                                                    className={
                                                        styles.detailsPanel
                                                    }
                                                >
                                                    {ship.description && (
                                                        <p
                                                            className={
                                                                styles.detailsDescription
                                                            }
                                                        >
                                                            {ship.description}
                                                        </p>
                                                    )}
                                                    <div
                                                        className={
                                                            styles.detailsGrid
                                                        }
                                                    >
                                                        <div>
                                                            <p
                                                                className={
                                                                    styles.detailsLabel
                                                                }
                                                            >
                                                                Frame
                                                            </p>
                                                            <p
                                                                className={
                                                                    styles.detailsValue
                                                                }
                                                            >
                                                                {ship.frame
                                                                    ?.name ??
                                                                    "Unknown"}
                                                            </p>
                                                            {ship.frame
                                                                ?.symbol && (
                                                                <p
                                                                    className={
                                                                        styles.detailsMeta
                                                                    }
                                                                >
                                                                    {
                                                                        ship
                                                                            .frame
                                                                            .symbol
                                                                    }
                                                                </p>
                                                            )}
                                                            {ship.frame
                                                                ?.moduleSlots !==
                                                                undefined && (
                                                                <p
                                                                    className={
                                                                        styles.detailsMeta
                                                                    }
                                                                >
                                                                    Slots:{" "}
                                                                    {
                                                                        ship
                                                                            .frame
                                                                            .moduleSlots
                                                                    }
                                                                </p>
                                                            )}
                                                            {ship.frame
                                                                ?.mountingPoints !==
                                                                undefined && (
                                                                <p
                                                                    className={
                                                                        styles.detailsMeta
                                                                    }
                                                                >
                                                                    Mounts:{" "}
                                                                    {
                                                                        ship
                                                                            .frame
                                                                            .mountingPoints
                                                                    }
                                                                </p>
                                                            )}
                                                            {ship.frame
                                                                ?.fuelCapacity !==
                                                                undefined && (
                                                                <p
                                                                    className={
                                                                        styles.detailsMeta
                                                                    }
                                                                >
                                                                    Fuel:{" "}
                                                                    {
                                                                        ship
                                                                            .frame
                                                                            .fuelCapacity
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p
                                                                className={
                                                                    styles.detailsLabel
                                                                }
                                                            >
                                                                Reactor
                                                            </p>
                                                            <p
                                                                className={
                                                                    styles.detailsValue
                                                                }
                                                            >
                                                                {ship.reactor
                                                                    ?.name ??
                                                                    "Unknown"}
                                                            </p>
                                                            {ship.reactor
                                                                ?.powerOutput !==
                                                                undefined && (
                                                                <p
                                                                    className={
                                                                        styles.detailsMeta
                                                                    }
                                                                >
                                                                    Power:{" "}
                                                                    {
                                                                        ship
                                                                            .reactor
                                                                            .powerOutput
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p
                                                                className={
                                                                    styles.detailsLabel
                                                                }
                                                            >
                                                                Engine
                                                            </p>
                                                            <p
                                                                className={
                                                                    styles.detailsValue
                                                                }
                                                            >
                                                                {ship.engine
                                                                    ?.name ??
                                                                    "Unknown"}
                                                            </p>
                                                            {ship.engine
                                                                ?.speed !==
                                                                undefined && (
                                                                <p
                                                                    className={
                                                                        styles.detailsMeta
                                                                    }
                                                                >
                                                                    Speed:{" "}
                                                                    {
                                                                        ship
                                                                            .engine
                                                                            .speed
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p
                                                                className={
                                                                    styles.detailsLabel
                                                                }
                                                            >
                                                                Crew
                                                            </p>
                                                            <p
                                                                className={
                                                                    styles.detailsValue
                                                                }
                                                            >
                                                                {ship.crew
                                                                    ?.required
                                                                    ? `${ship.crew.required}/${ship.crew.capacity ?? "-"}`
                                                                    : "Unknown"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.detailsList
                                                        }
                                                    >
                                                        <div>
                                                            <p
                                                                className={
                                                                    styles.detailsLabel
                                                                }
                                                            >
                                                                Modules
                                                            </p>
                                                            <p
                                                                className={
                                                                    styles.detailsValue
                                                                }
                                                            >
                                                                {formatList(
                                                                    ship.modules,
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p
                                                                className={
                                                                    styles.detailsLabel
                                                                }
                                                            >
                                                                Mounts
                                                            </p>
                                                            <p
                                                                className={
                                                                    styles.detailsValue
                                                                }
                                                            >
                                                                {formatList(
                                                                    ship.mounts,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
        </section>
    );
};

export default Shipyard;
