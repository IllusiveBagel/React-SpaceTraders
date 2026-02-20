import { Outlet } from "react-router-dom";

import Sidebar from "components/Sidebar";
import Header from "components/Header";
import { PageTitleProvider } from "components/Layout/PageTitleContext";

import styles from "./Layout.module.css";

const Layout = () => {
    return (
        <div className={styles.layout}>
            <Sidebar />
            <PageTitleProvider>
                <Header />
                <main className={styles.main}>
                    <Outlet />
                </main>
            </PageTitleProvider>
        </div>
    );
};

export default Layout;
