import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "components/Sidebar";
import Header from "components/Header";
import { PageTitleProvider } from "components/Layout/PageTitleContext";

import styles from "./Layout.module.css";

const Layout = () => {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    return (
        <div className={styles.layout}>
            <Sidebar
                isMobileOpen={isMobileNavOpen}
                onMobileClose={() => setIsMobileNavOpen(false)}
            />
            <PageTitleProvider>
                <Header
                    isMobileNavOpen={isMobileNavOpen}
                    onMobileNavToggle={() =>
                        setIsMobileNavOpen((open) => !open)
                    }
                />
                <main className={styles.main}>
                    <Outlet />
                </main>
            </PageTitleProvider>
        </div>
    );
};

export default Layout;
