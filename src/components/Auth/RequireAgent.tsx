import { Navigate } from "react-router-dom";

import { hasAgentToken } from "services/tokenStore";

type RequireAgentProps = {
    children: JSX.Element;
};

const RequireAgent = ({ children }: RequireAgentProps) => {
    if (!hasAgentToken()) {
        return <Navigate to="/select-agent" replace />;
    }

    return children;
};

export default RequireAgent;
