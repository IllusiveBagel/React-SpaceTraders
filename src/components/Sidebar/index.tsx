import { Link } from "react-router-dom";

import styles from "./Sidebar.module.css";

const Sidebar = () => {
    return (
        <div className={styles.sidebar}>
            <h2 className={styles.brand}>Space Traders</h2>
            <ul className={styles.nav}>
                <li>
                    <Link className={styles.link} to="/">
                        Home
                    </Link>
                </li>
                <li>
                    <Link className={styles.link} to="/fleet">
                        Fleet
                    </Link>
                </li>
                <li>
                    <Link className={styles.link} to="/contracts">
                        Contracts
                    </Link>
                </li>
                <li>
                    <Link className={styles.link} to="/market">
                        Market
                    </Link>
                </li>
                <li>
                    <Link className={styles.link} to="/shipyard">
                        Shipyard
                    </Link>
                </li>
                <li>
                    <Link className={styles.link} to="/map">
                        Map
                    </Link>
                </li>
                <li>
                    <Link className={styles.link} to="/automation">
                        Automation
                    </Link>
                </li>
                <li>
                    <Link className={styles.link} to="/systems">
                        Systems
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
