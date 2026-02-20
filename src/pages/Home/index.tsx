import AgentInfo from "components/Home/AgentInfo";
import Contracts from "components/Home/Contracts";

import styles from "./Home.module.css";

const Home = () => {
    return (
        <div className={styles.home}>
            <AgentInfo />
            <Contracts />
        </div>
    );
};

export default Home;
