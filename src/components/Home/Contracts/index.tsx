import useGetContracts from "hooks/contracts/useGetContracts";
import ContractCard from "components/Home/ContractCard";

import styles from "./Contracts.module.css";

const Contracts = () => {
    const { data: contracts, isLoading, error } = useGetContracts();

    if (isLoading)
        return <div className={styles.loading}>Loading contracts...</div>;
    if (error)
        return <div className={styles.error}>Error loading contracts.</div>;

    return (
        <>
            {contracts && (
                <div className={styles.contracts}>
                    <h1 className={styles.title}>Contracts</h1>
                    <div className={styles.list}>
                        {contracts.length > 0 ? (
                            contracts.map((contract) => (
                                <ContractCard
                                    key={contract.id}
                                    contract={contract}
                                />
                            ))
                        ) : (
                            <p className={styles.empty}>No contracts found.</p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Contracts;
