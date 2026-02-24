import type { ReactNode } from "react";

import styles from "./DetailsBlock.module.css";

type DetailBlockProps = {
    title: string;
    children: ReactNode;
    long?: boolean;
};

const DetailBlock = ({ title, children, long = false }: DetailBlockProps) => {
    return (
        <div
            className={`${styles.detailBlock} ${long ? styles.longBlock : ""}`}
        >
            <h3 className={styles.detailTitle}>{title}</h3>
            {children}
        </div>
    );
};

export default DetailBlock;
