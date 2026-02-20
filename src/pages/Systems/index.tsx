import { useState } from "react";
import { Link } from "react-router-dom";

import Pagination from "components/Pagination";
import useGetSystems from "hooks/systems/useGetSystems";

import styles from "./Systems.module.css";

const Systems = () => {
    const [page, setPage] = useState(1);
    const limit = 20;

    const { data: systems, isLoading, error } = useGetSystems({ page, limit });

    const totalItems = systems?.meta?.total ?? 0;

    return (
        <div className={styles.systems}>
            <h1 className={styles.title}>Systems</h1>
            <div className={styles.list}>
                {isLoading && <p>Loading...</p>}
                {error && <p>Error loading systems.</p>}
                {systems &&
                    systems.data.map((system) => (
                        <Link
                            key={system.symbol}
                            to={`/systems/${system.symbol}`}
                            className={`${styles.item} ${styles.itemLink}`}
                        >
                            <div className={styles.itemHeader}>
                                <div>
                                    <h2 className={styles.name}>
                                        {system.name}
                                    </h2>
                                    <p className={styles.symbol}>
                                        {system.symbol}
                                    </p>
                                </div>
                                <span className={styles.type}>
                                    {system.type}
                                </span>
                            </div>
                            <div className={styles.itemDetails}>
                                <div>
                                    <p className={styles.label}>Sector</p>
                                    <p className={styles.value}>
                                        {system.sectorSymbol}
                                    </p>
                                </div>
                                <div>
                                    <p className={styles.label}>
                                        Constellation
                                    </p>
                                    <p className={styles.value}>
                                        {system.constellation}
                                    </p>
                                </div>
                                <div>
                                    <p className={styles.label}>Coordinates</p>
                                    <p className={styles.value}>
                                        {system.x}, {system.y}
                                    </p>
                                </div>
                                <div>
                                    <p className={styles.label}>Waypoints</p>
                                    <p className={styles.value}>
                                        {system.waypoints.length}
                                    </p>
                                </div>
                                <div>
                                    <p className={styles.label}>Factions</p>
                                    <p className={styles.value}>
                                        {system.factions.length}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
            </div>
            <div className={styles.pagination}>
                <Pagination
                    page={page}
                    total={totalItems}
                    limit={limit}
                    onPageChange={setPage}
                    isDisabled={isLoading}
                />
            </div>
        </div>
    );
};

export default Systems;
