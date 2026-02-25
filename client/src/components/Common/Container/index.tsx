import styles from "./Container.module.css";

const Container = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <section className={`${styles.container} ${className}`}>
            {children}
        </section>
    );
};

export default Container;
