import type { Ship } from "types/Ship";

import { useMutateShip } from "hooks/Ship";
import { useContractsWithStore, useMutateContract } from "hooks/Contracts";

import styles from "./ShipCargo.module.css";

const ShipCargo = ({ ship }: { ship: Ship }) => {
    const { jettisonCargo, sellCargo } = useMutateShip(ship.symbol);
    const { deliverCargoToContract } = useMutateContract(ship.symbol);
    const { contracts } = useContractsWithStore();

    const cargoPercent = ship
        ? ship.cargo.capacity > 0
            ? Math.min(
                  100,
                  Math.round((ship.cargo.units / ship.cargo.capacity) * 100),
              )
            : 0
        : 0;

    if (!ship) {
        return <div>Loading cargo...</div>;
    }

    return (
        <div className={styles.cargoPanel}>
            <div className={styles.cargoHeader}>
                <div>
                    <p className={styles.cargoTitle}>Cargo capacity</p>
                    <p className={styles.cargoNumbers}>
                        {ship.cargo.units}/{ship.cargo.capacity} units •{" "}
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
                <div className={styles.cargoTableWrapper}>
                    <table className={styles.cargoTable}>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Units</th>
                                <th>Description</th>
                                <th className={styles.cargoActions}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ship.cargo.inventory.map((item) => (
                                <tr key={`${ship.symbol}-${item.symbol}`}>
                                    <td className={styles.cargoItem}>
                                        {item.name}
                                    </td>
                                    <td>{item.units}</td>
                                    <td className={styles.cargoDesc}>
                                        {item.description || "No description"}
                                    </td>
                                    <td className={styles.cargoActions}>
                                        <button
                                            type="button"
                                            disabled={
                                                ship.nav.status !== "DOCKED"
                                            }
                                            onClick={() =>
                                                sellCargo.mutate({
                                                    cargoSymbol: item.symbol,
                                                    units: item.units,
                                                })
                                            }
                                        >
                                            Sell
                                        </button>
                                        <button
                                            type="button"
                                            disabled={item.units === 0}
                                            onClick={() =>
                                                jettisonCargo.mutate({
                                                    cargoSymbol: item.symbol,
                                                    units: item.units,
                                                })
                                            }
                                        >
                                            Jettison
                                        </button>
                                        <button
                                            type="button"
                                            disabled={
                                                ship.nav.status !== "DOCKED"
                                            }
                                            onClick={() =>
                                                deliverCargoToContract.mutate({
                                                    contractId:
                                                        contracts[0]?.id,
                                                    tradeSymbol: item.symbol,
                                                    units: item.units,
                                                })
                                            }
                                        >
                                            Deliver
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className={styles.detailText}>Cargo bay is empty.</p>
            )}
        </div>
    );
};

export default ShipCargo;
