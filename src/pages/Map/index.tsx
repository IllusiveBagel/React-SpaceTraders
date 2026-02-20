import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import useGetShips from "hooks/fleet/useGetShips";
import useGetSystem from "hooks/systems/useGetSystem";
import { usePageTitle } from "components/Layout/PageTitleContext";

import styles from "./Map.module.css";

type WaypointPoint = {
    symbol: string;
    type: string;
    x: number;
    y: number;
    xPercent: number;
    yPercent: number;
};

const MAP_PADDING_PERCENT = 12;
const MIN_SCALE = 0.6;
const MAX_SCALE = 2.5;
const ZOOM_STEP = 0.12;

const Map = () => {
    usePageTitle("Map");

    const { data: ships, isLoading, error } = useGetShips();
    const [selectedShipSymbol, setSelectedShipSymbol] = useState("");
    const [scale, setScale] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [hoveredWaypointSymbol, setHoveredWaypointSymbol] = useState<
        string | null
    >(null);
    const [hoveredShipSymbol, setHoveredShipSymbol] = useState<string | null>(
        null,
    );
    const dragState = useRef({
        active: false,
        startX: 0,
        startY: 0,
        originX: 0,
        originY: 0,
    });

    const systemSymbols = useMemo(() => {
        if (!ships || ships.length === 0) {
            return [] as string[];
        }

        const unique = new Set<string>();
        ships.forEach((ship) => unique.add(ship.nav.systemSymbol));
        return Array.from(unique);
    }, [ships]);

    const hasMultipleSystems = systemSymbols.length > 1;

    useEffect(() => {
        if (!hasMultipleSystems) {
            return;
        }

        if (!ships || ships.length === 0) {
            return;
        }

        const selectedStillValid = ships.some(
            (ship) => ship.symbol === selectedShipSymbol,
        );

        if (!selectedShipSymbol || !selectedStillValid) {
            setSelectedShipSymbol(ships[0].symbol);
        }
    }, [hasMultipleSystems, selectedShipSymbol, ships]);

    const selectedShip = useMemo(() => {
        if (!ships || !selectedShipSymbol) {
            return undefined;
        }

        return ships.find((ship) => ship.symbol === selectedShipSymbol);
    }, [ships, selectedShipSymbol]);

    const activeSystemSymbol = hasMultipleSystems
        ? selectedShip?.nav.systemSymbol
        : ships?.[0]?.nav.systemSymbol;

    const {
        data: system,
        isLoading: systemLoading,
        error: systemError,
    } = useGetSystem(activeSystemSymbol);

    const waypoints = system?.waypoints ?? [];

    const bounds = useMemo(() => {
        if (waypoints.length === 0) {
            return {
                minX: 0,
                maxX: 0,
                minY: 0,
                maxY: 0,
            };
        }

        return waypoints.reduce(
            (acc, waypoint) => {
                acc.minX = Math.min(acc.minX, waypoint.x);
                acc.maxX = Math.max(acc.maxX, waypoint.x);
                acc.minY = Math.min(acc.minY, waypoint.y);
                acc.maxY = Math.max(acc.maxY, waypoint.y);
                return acc;
            },
            {
                minX: waypoints[0].x,
                maxX: waypoints[0].x,
                minY: waypoints[0].y,
                maxY: waypoints[0].y,
            },
        );
    }, [waypoints]);

    const waypointPoints = useMemo(() => {
        if (waypoints.length === 0) {
            return [] as WaypointPoint[];
        }

        const spanX = Math.max(1, bounds.maxX - bounds.minX);
        const spanY = Math.max(1, bounds.maxY - bounds.minY);
        const usablePercent = 100 - MAP_PADDING_PERCENT * 2;

        return waypoints.map((waypoint) => {
            const normalizedX = (waypoint.x - bounds.minX) / spanX;
            const normalizedY = (waypoint.y - bounds.minY) / spanY;
            const xPercent = MAP_PADDING_PERCENT + normalizedX * usablePercent;
            const yPercent =
                MAP_PADDING_PERCENT + (1 - normalizedY) * usablePercent;

            return {
                symbol: waypoint.symbol,
                type: waypoint.type,
                x: waypoint.x,
                y: waypoint.y,
                xPercent,
                yPercent,
            };
        });
    }, [bounds, waypoints]);

    const shipMarkers = useMemo(() => {
        if (!ships || !activeSystemSymbol || waypointPoints.length === 0) {
            return [] as {
                symbol: string;
                name: string;
                xPercent: number;
                yPercent: number;
                offsetX: number;
                offsetY: number;
            }[];
        }

        const pointsBySymbol = new globalThis.Map(
            waypointPoints.map((point) => [point.symbol, point]),
        );
        const shipsByWaypoint = new globalThis.Map<string, typeof ships>();

        ships.forEach((ship) => {
            if (ship.nav.systemSymbol !== activeSystemSymbol) {
                return;
            }

            const key = ship.nav.waypointSymbol;
            const group = shipsByWaypoint.get(key) ?? [];
            group.push(ship);
            shipsByWaypoint.set(key, group);
        });

        const markers: {
            symbol: string;
            name: string;
            xPercent: number;
            yPercent: number;
            offsetX: number;
            offsetY: number;
        }[] = [];

        shipsByWaypoint.forEach((group, waypointSymbol) => {
            const point = pointsBySymbol.get(waypointSymbol);
            if (!point) {
                return;
            }

            const count = group.length;
            group.forEach((ship, index) => {
                const angle = count > 1 ? (index / count) * Math.PI * 2 : 0;
                const radius = count > 1 ? 10 : 0;
                markers.push({
                    symbol: ship.symbol,
                    name: ship.registration.name,
                    xPercent: point.xPercent,
                    yPercent: point.yPercent,
                    offsetX: Math.cos(angle) * radius,
                    offsetY: Math.sin(angle) * radius,
                });
            });
        });

        return markers;
    }, [ships, activeSystemSymbol, waypointPoints]);

    const hoveredWaypoint = useMemo(
        () =>
            hoveredWaypointSymbol
                ? waypointPoints.find(
                      (point) => point.symbol === hoveredWaypointSymbol,
                  )
                : undefined,
        [hoveredWaypointSymbol, waypointPoints],
    );

    const hoveredShip = useMemo(
        () =>
            hoveredShipSymbol
                ? shipMarkers.find(
                      (marker) => marker.symbol === hoveredShipSymbol,
                  )
                : undefined,
        [hoveredShipSymbol, shipMarkers],
    );

    const shipsInSystem = useMemo(() => {
        if (!ships || !activeSystemSymbol) {
            return 0;
        }

        return ships.filter(
            (ship) => ship.nav.systemSymbol === activeSystemSymbol,
        ).length;
    }, [ships, activeSystemSymbol]);

    const showShipState =
        isLoading ||
        error ||
        (!isLoading && !error && (!ships || ships.length === 0));
    const showSystemState =
        systemLoading ||
        systemError ||
        (!systemLoading &&
            !systemError &&
            activeSystemSymbol &&
            waypoints.length === 0);
    const showStatus = showShipState || showSystemState;

    useEffect(() => {
        const handleMove = (event: MouseEvent) => {
            if (!dragState.current.active) {
                return;
            }

            const deltaX = event.clientX - dragState.current.startX;
            const deltaY = event.clientY - dragState.current.startY;
            setTranslate({
                x: dragState.current.originX + deltaX,
                y: dragState.current.originY + deltaY,
            });
        };

        const handleUp = () => {
            dragState.current.active = false;
        };

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };
    }, []);

    const clamp = (value: number, min: number, max: number) =>
        Math.min(max, Math.max(min, value));

    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        event.preventDefault();
        const direction = event.deltaY > 0 ? -1 : 1;
        setScale((current) =>
            clamp(current + direction * ZOOM_STEP, MIN_SCALE, MAX_SCALE),
        );
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button !== 0) {
            return;
        }

        const target = event.target as HTMLElement;
        if (target.closest("a")) {
            return;
        }

        dragState.current.active = true;
        dragState.current.startX = event.clientX;
        dragState.current.startY = event.clientY;
        dragState.current.originX = translate.x;
        dragState.current.originY = translate.y;
    };

    return (
        <section className={styles.map}>
            <div
                className={styles.mapViewport}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
            >
                <div
                    className={styles.mapContent}
                    style={{
                        transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                        ["--inverse-scale" as string]: `${1 / scale}`,
                    }}
                >
                    {shipMarkers.map((marker) => (
                        <div
                            key={marker.symbol}
                            className={styles.shipMarker}
                            style={{
                                left: `${marker.xPercent}%`,
                                top: `${marker.yPercent}%`,
                                ["--ship-offset-x" as string]: `${marker.offsetX}px`,
                                ["--ship-offset-y" as string]: `${marker.offsetY}px`,
                            }}
                            title={marker.name}
                        >
                            <Link
                                to={`/fleet/${marker.symbol}`}
                                className={styles.shipHit}
                                onMouseEnter={() =>
                                    setHoveredShipSymbol(marker.symbol)
                                }
                                onMouseLeave={() => setHoveredShipSymbol(null)}
                                onFocus={() =>
                                    setHoveredShipSymbol(marker.symbol)
                                }
                                onBlur={() => setHoveredShipSymbol(null)}
                            >
                                <span className={styles.shipDot} />
                            </Link>
                        </div>
                    ))}
                    {waypointPoints.map((point) => (
                        <div
                            key={point.symbol}
                            className={styles.waypoint}
                            style={{
                                left: `${point.xPercent}%`,
                                top: `${point.yPercent}%`,
                            }}
                            title={`${point.symbol} (${point.x}, ${point.y})`}
                        >
                            <Link
                                to={`/systems/${activeSystemSymbol}/waypoints/${point.symbol}`}
                                className={styles.waypointLink}
                                onMouseEnter={() =>
                                    setHoveredWaypointSymbol(point.symbol)
                                }
                                onMouseLeave={() =>
                                    setHoveredWaypointSymbol(null)
                                }
                                onFocus={() =>
                                    setHoveredWaypointSymbol(point.symbol)
                                }
                                onBlur={() => setHoveredWaypointSymbol(null)}
                            >
                                <span className={styles.point} />
                            </Link>
                        </div>
                    ))}
                    {hoveredWaypoint && (
                        <div
                            className={`${styles.hoverLabel} ${styles.hoverLabelWaypoint}`}
                            style={{
                                left: `${hoveredWaypoint.xPercent}%`,
                                top: `${hoveredWaypoint.yPercent}%`,
                            }}
                        >
                            {hoveredWaypoint.symbol}
                        </div>
                    )}
                    {hoveredShip && (
                        <div
                            className={`${styles.hoverLabel} ${styles.hoverLabelShip}`}
                            style={{
                                left: `${hoveredShip.xPercent}%`,
                                top: `${hoveredShip.yPercent}%`,
                                ["--label-offset-x" as string]: `${hoveredShip.offsetX}px`,
                                ["--label-offset-y" as string]: `${hoveredShip.offsetY}px`,
                            }}
                        >
                            {hoveredShip.name}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.overlay}>
                {hasMultipleSystems && (
                    <header className={styles.header}>
                        <div className={styles.selector}>
                            <label className={styles.label} htmlFor="map-ship">
                                Ship
                            </label>
                            <select
                                id="map-ship"
                                className={styles.select}
                                value={selectedShipSymbol}
                                onChange={(event) =>
                                    setSelectedShipSymbol(event.target.value)
                                }
                                disabled={
                                    isLoading || (ships?.length ?? 0) === 0
                                }
                            >
                                {(ships ?? []).map((ship) => (
                                    <option
                                        key={ship.symbol}
                                        value={ship.symbol}
                                    >
                                        {ship.registration.name} ({ship.symbol})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </header>
                )}

                {activeSystemSymbol && !systemLoading && !systemError && (
                    <div className={styles.meta}>
                        <div>
                            <p className={styles.metaLabel}>System</p>
                            <p className={styles.metaValue}>
                                {activeSystemSymbol}
                            </p>
                        </div>
                        {hasMultipleSystems && selectedShip && (
                            <div>
                                <p className={styles.metaLabel}>Ship</p>
                                <p className={styles.metaValue}>
                                    {selectedShip.registration.name}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className={styles.metaLabel}>Ships in system</p>
                            <p className={styles.metaValue}>{shipsInSystem}</p>
                        </div>
                        <div>
                            <p className={styles.metaLabel}>Waypoints</p>
                            <p className={styles.metaValue}>
                                {waypoints.length}
                            </p>
                        </div>
                    </div>
                )}

                {showStatus && (
                    <div className={styles.statusPanel}>
                        {isLoading && (
                            <p className={styles.state}>Loading ships...</p>
                        )}
                        {error && (
                            <p className={styles.error}>
                                Error loading ships: {error.message}
                            </p>
                        )}

                        {!isLoading &&
                            !error &&
                            (!ships || ships.length === 0) && (
                                <p className={styles.state}>
                                    No ships available.
                                </p>
                            )}

                        {systemLoading && (
                            <p className={styles.state}>
                                Loading system map...
                            </p>
                        )}
                        {systemError && (
                            <p className={styles.error}>
                                Error loading system: {systemError.message}
                            </p>
                        )}

                        {!systemLoading &&
                            !systemError &&
                            activeSystemSymbol &&
                            waypoints.length === 0 && (
                                <p className={styles.state}>
                                    No waypoints reported for this system.
                                </p>
                            )}
                    </div>
                )}

                {!systemLoading &&
                    !systemError &&
                    activeSystemSymbol &&
                    waypoints.length > 0 && (
                        <div className={styles.legend}>
                            <div>
                                <span className={styles.legendDot} />
                                <span>Waypoint</span>
                            </div>
                            <div className={styles.legendMeta}>
                                X: {bounds.minX} to {bounds.maxX} | Y:{" "}
                                {bounds.minY} to {bounds.maxY}
                            </div>
                        </div>
                    )}
            </div>
        </section>
    );
};

export default Map;
