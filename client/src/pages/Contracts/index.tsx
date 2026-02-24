import Container from "components/Common/Container";
import Contracts from "components/Contracts";
import { usePageTitle } from "components/Layout/PageTitleContext";

const ContractsPage = () => {
    usePageTitle("Contracts");

    return (
        <Container>
            <Contracts />
        </Container>
    );
};

export default ContractsPage;
