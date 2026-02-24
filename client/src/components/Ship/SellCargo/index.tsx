import { useMemo, useState } from "react";

import useShipActions from "hooks/fleet/useShipActions";

import Card from "components/Common/Card";

import type { Ship } from "types/fleet";

import styles from "./SellCargo.module.css";

type SellCargoProps = {
    ship: Ship;
    shipSymbol: string;
    handleAction: (
        action: () => Promise<unknown>,
        message: string,
    ) => Promise<void>;
    setActionError: (message: string | null) => void;
};

const SellCargo = ({
    ship,
    shipSymbol,
    handleAction,
    setActionError,
}: SellCargoProps) => {
    const { sell, jettison, isWorking } = useShipActions(shipSymbol);

    const [sellSymbol, setSellSymbol] = useState("");
    const [sellUnits, setSellUnits] = useState("");

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

    const hasCargo = ship ? ship.cargo.units > 0 : false;

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

    return (
        <Card title="Sell cargo" cardLight>
            <div className={styles.controlRow}>
                <select
                    value={sellSymbolValue}
                    onChange={(event) => setSellSymbol(event.target.value)}
                    disabled={isWorking || !hasCargo}
                >
                    {!hasCargo ? (
                        <option value="">No cargo available</option>
                    ) : (
                        cargoSymbols.map((symbol) => (
                            <option key={symbol} value={symbol}>
                                {symbol}
                            </option>
                        ))
                    )}
                </select>
                <input
                    type="number"
                    min={1}
                    value={sellUnits}
                    onChange={(event) => setSellUnits(event.target.value)}
                    placeholder="Units"
                />
            </div>
            <div className={styles.controlRow}>
                <button
                    type="button"
                    onClick={handleSell}
                    disabled={isWorking || !hasCargo}
                >
                    Sell
                </button>
                <button
                    type="button"
                    onClick={handleJettison}
                    disabled={isWorking || !hasCargo}
                >
                    Jettison
                </button>
                <span className={styles.controlHint}>
                    {ship.cargo.units}/{ship.cargo.capacity} units
                </span>
            </div>
        </Card>
    );
};

export default SellCargo;
