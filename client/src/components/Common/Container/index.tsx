import styles from "./Container.module.css";

const Container = ({ children }: { children: React.ReactNode }) => {
    return <section className={styles.container}>{children}</section>;
};

export default Container;
