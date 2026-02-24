import styles from "./Card.module.css";

const Card = ({
    title,
    subTitle,
    cardWide,
    children,
}: {
    title: string;
    subTitle: string;
    cardWide?: boolean;
    children: React.ReactNode;
}) => {
    return (
        <article
            className={`${styles.card} ${cardWide ? styles.cardWide : ""}`}
        >
            <div className={styles.cardHeader}>
                <div>
                    <h2 className={styles.cardTitle}>{title}</h2>
                    <p className={styles.cardSub}>{subTitle}</p>
                </div>
            </div>
            <div className={styles.cardBody}>{children}</div>
        </article>
    );
};

export default Card;
