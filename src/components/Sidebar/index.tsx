import { Link } from "react-router-dom";

import styles from "./Sidebar.module.css";

const Sidebar = () => {
    return (
        <div className={styles.sidebar}>
            <h2 className={styles.brand}>Navigation</h2>
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
                    <Link className={styles.link} to="/systems">
                        Systems
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
