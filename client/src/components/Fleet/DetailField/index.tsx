import styles from "./DetailField.module.css";

type DetailFieldProps = {
    label: string;
    value: string | number;
};

const DetailField = ({ label, value }: DetailFieldProps) => {
    return (
        <p className={styles.detailText}>
            {label}: {value}
        </p>
    );
};

export default DetailField;
