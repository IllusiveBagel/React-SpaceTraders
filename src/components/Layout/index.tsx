import { Outlet } from "react-router-dom";

import Sidebar from "components/Sidebar";
import Header from "components/Header";

import styles from "./Layout.module.css";

const Layout = () => {
    return (
        <div className={styles.layout}>
            <Sidebar />
            <Header />
            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
