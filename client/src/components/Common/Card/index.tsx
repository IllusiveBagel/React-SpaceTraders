import styles from "./Card.module.css";

type CardProps = {
    title: string;
    subTitle?: string;
    cardWide?: boolean;
    cardLight?: boolean;
    children: React.ReactNode;
    className?: string;
};

const Card = ({
    title,
    subTitle,
    cardWide,
    cardLight,
    children,
    className,
}: CardProps) => {
    return (
        <article
            className={`${styles.card} ${cardWide ? styles.cardWide : ""} ${cardLight ? styles.cardLight : ""} ${className ? className : ""}`}
        >
            <div className={styles.cardHeader}>
                <div>
                    <h2 className={styles.cardTitle}>{title}</h2>
                    {subTitle && <p className={styles.cardSub}>{subTitle}</p>}
                </div>
            </div>
            <div className={styles.cardBody}>{children}</div>
        </article>
    );
};

export default Card;
