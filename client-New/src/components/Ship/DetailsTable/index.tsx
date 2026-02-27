import styles from "./DetailsTable.module.css";

const DetailsTable = ({
    data,
}: {
    data: { label: string; value: string | number }[];
}) => {
    return (
        <table className={styles.table}>
            <tbody>
                {data.map((item) => (
                    <tr key={item.label}>
                        <td className={styles.label}>{item.label}:</td>
                        <td className={styles.value}>{item.value}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default DetailsTable;
