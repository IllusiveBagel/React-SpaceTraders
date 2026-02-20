import { useEffect, useMemo, useState } from "react";

import useGetShips from "hooks/fleet/useGetShips";
import useGetMarket from "hooks/market/useGetMarket";
import useMarketActions from "hooks/market/useMarketActions";
import { usePageTitle } from "components/Layout/PageTitleContext";

import styles from "./Market.module.css";

const Market = () => {
    usePageTitle("Market");

    const { data: ships, isLoading, error } = useGetShips();
    const [selectedShipSymbol, setSelectedShipSymbol] = useState("");
    const [purchaseUnits, setPurchaseUnits] = useState<Record<string, string>>(
        {},
    );
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

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
    const { purchase, sell, isPurchasing, isSelling } =
        useMarketActions(selectedShipSymbol);

    const {
        data: market,
        isLoading: marketLoading,
        error: marketError,
    } = useGetMarket(systemSymbol, waypointSymbol);

    const importsCount = market?.imports?.length ?? 0;
    const exportsCount = market?.exports?.length ?? 0;
    const exchangeCount = market?.exchange?.length ?? 0;

    const tradeGoods = market?.tradeGoods ?? [];
    const hasMarket = market !== null && market !== undefined;

    const handlePurchase = async (symbol: string) => {
        setActionError(null);
        setActionMessage(null);

        const unitsValue = purchaseUnits[symbol] ?? "1";
        const units = Number(unitsValue);
        if (!units || Number.isNaN(units) || units <= 0) {
            setActionError("Enter a valid unit count to purchase.");
            return;
        }

        try {
            await purchase({ symbol, units });
            setActionMessage(`Purchased ${units} ${symbol}.`);
            setPurchaseUnits((current) => ({ ...current, [symbol]: "1" }));
        } catch (err) {
            setActionError(
                err instanceof Error ? err.message : "Purchase failed.",
            );
        }
    };

    const handleSell = async (symbol: string) => {
        setActionError(null);
        setActionMessage(null);

        const unitsValue = purchaseUnits[symbol] ?? "1";
        const units = Number(unitsValue);
        if (!units || Number.isNaN(units) || units <= 0) {
            setActionError("Enter a valid unit count to sell.");
            return;
        }

        const availableUnits =
            selectedShip?.cargo.inventory.find((item) => item.symbol === symbol)
                ?.units ?? 0;

        if (availableUnits <= 0) {
            setActionError(`No ${symbol} in cargo.`);
            return;
        }

        if (units > availableUnits) {
            setActionError(`Only ${availableUnits} ${symbol} in cargo.`);
            return;
        }

        try {
            await sell({ symbol, units });
            setActionMessage(`Sold ${units} ${symbol}.`);
            setPurchaseUnits((current) => ({ ...current, [symbol]: "1" }));
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Sell failed.");
        }
    };

    return (
        <section className={styles.market}>
            <header className={styles.header}>
                <div>
                    <p className={styles.subtitle}>
                        Browse trade goods at a ship&#39;s current waypoint.
                    </p>
                </div>
                <div className={styles.selector}>
                    <label className={styles.label} htmlFor="market-ship">
                        Ship
                    </label>
                    <select
                        id="market-ship"
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

            {marketLoading && (
                <p className={styles.state}>Loading market data...</p>
            )}
            {marketError && (
                <p className={styles.error}>
                    Error loading market: {marketError.message}
                </p>
            )}
            {actionError && <p className={styles.error}>{actionError}</p>}
            {actionMessage && <p className={styles.state}>{actionMessage}</p>}

            {!marketLoading &&
                !marketError &&
                selectedShip &&
                market === null && (
                    <p className={styles.state}>
                        No market data available at this waypoint.
                    </p>
                )}

            {!marketLoading && !marketError && selectedShip && hasMarket && (
                <div className={styles.content}>
                    <div className={styles.summary}>
                        <div className={styles.summaryCard}>
                            <p className={styles.summaryLabel}>Imports</p>
                            <p className={styles.summaryValue}>
                                {importsCount}
                            </p>
                        </div>
                        <div className={styles.summaryCard}>
                            <p className={styles.summaryLabel}>Exports</p>
                            <p className={styles.summaryValue}>
                                {exportsCount}
                            </p>
                        </div>
                        <div className={styles.summaryCard}>
                            <p className={styles.summaryLabel}>Exchange</p>
                            <p className={styles.summaryValue}>
                                {exchangeCount}
                            </p>
                        </div>
                    </div>

                    {tradeGoods.length === 0 ? (
                        <p className={styles.state}>
                            No trade goods reported for this waypoint.
                        </p>
                    ) : (
                        <div className={styles.table}>
                            <div className={styles.tableHeader}>
                                <span>Symbol</span>
                                <span>Type</span>
                                <span>Supply</span>
                                <span>Activity</span>
                                <span>Buy</span>
                                <span>Sell</span>
                                <span>Units</span>
                                <span></span>
                            </div>
                            {tradeGoods.map((good) => (
                                <div
                                    key={good.symbol}
                                    className={styles.tableRow}
                                >
                                    <span className={styles.tablePrimary}>
                                        {good.symbol}
                                    </span>
                                    <span>{good.type}</span>
                                    <span>{good.supply}</span>
                                    <span>{good.activity ?? "-"}</span>
                                    <span>{good.purchasePrice}</span>
                                    <span>{good.sellPrice}</span>
                                    <span>
                                        <input
                                            className={styles.unitsInput}
                                            type="number"
                                            min={1}
                                            value={
                                                purchaseUnits[good.symbol] ??
                                                "1"
                                            }
                                            onChange={(event) =>
                                                setPurchaseUnits((current) => ({
                                                    ...current,
                                                    [good.symbol]:
                                                        event.target.value,
                                                }))
                                            }
                                        />
                                    </span>
                                    <span className={styles.actionCell}>
                                        <button
                                            type="button"
                                            className={styles.purchaseButton}
                                            onClick={() =>
                                                handlePurchase(good.symbol)
                                            }
                                            disabled={
                                                isPurchasing ||
                                                isSelling ||
                                                marketLoading
                                            }
                                        >
                                            {isPurchasing
                                                ? "Purchasing..."
                                                : "Buy"}
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.sellButton}
                                            onClick={() =>
                                                handleSell(good.symbol)
                                            }
                                            disabled={
                                                isPurchasing ||
                                                isSelling ||
                                                marketLoading
                                            }
                                        >
                                            {isSelling ? "Selling..." : "Sell"}
                                        </button>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default Market;
