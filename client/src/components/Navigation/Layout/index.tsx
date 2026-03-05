import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "components/Navigation/Sidebar";
import Header from "components/Navigation/Header";
import ToastContainer from "components/Common/Toast/ToastContainer";

import styles from "./Layout.module.css";

const Layout = () => {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    return (
        <div className={styles.layout}>
            <Sidebar
                isMobileOpen={isMobileNavOpen}
                onMobileClose={() => setIsMobileNavOpen(false)}
            />
            <Header
                isMobileNavOpen={isMobileNavOpen}
                onMobileNavToggle={() => setIsMobileNavOpen((open) => !open)}
            />
            <main className={styles.main}>
                <Outlet />
            </main>
            <ToastContainer />
        </div>
    );
};

export default Layout;
