import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { clearAgentToken } from "services/tokenStore";

import styles from "./Sidebar.module.css";

type SidebarProps = {
    isMobileOpen: boolean;
    onMobileClose: () => void;
};

const Sidebar = ({ isMobileOpen, onMobileClose }: SidebarProps) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const handleSwitchAgent = () => {
        clearAgentToken();
        queryClient.clear();
        navigate("/select-agent");
        onMobileClose();
    };

    const handleNavClick = () => {
        onMobileClose();
    };

    return (
        <>
            <div
                className={`${styles.backdrop} ${
                    isMobileOpen ? styles.backdropOpen : ""
                }`}
                onClick={onMobileClose}
                aria-hidden
            />
            <div
                className={`${styles.sidebar} ${
                    isMobileOpen ? styles.sidebarOpen : ""
                }`}
            >
                <h2 className={styles.brand}>Space Traders</h2>
                <ul className={styles.nav}>
                    <li>
                        <Link
                            className={styles.link}
                            to="/"
                            onClick={handleNavClick}
                        >
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link
                            className={styles.link}
                            to="/fleet"
                            onClick={handleNavClick}
                        >
                            Fleet
                        </Link>
                    </li>
                    <li>
                        <Link
                            className={styles.link}
                            to="/contracts"
                            onClick={handleNavClick}
                        >
                            Contracts
                        </Link>
                    </li>
                </ul>
                <button
                    type="button"
                    className={styles.switchButton}
                    onClick={handleSwitchAgent}
                >
                    Switch agent
                </button>
            </div>
        </>
    );
};

export default Sidebar;
