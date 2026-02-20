import Contracts from "components/Home/Contracts";
import { usePageTitle } from "components/Layout/PageTitleContext";

const ContractsPage = () => {
    usePageTitle("Contracts");

    return <Contracts />;
};

export default ContractsPage;
