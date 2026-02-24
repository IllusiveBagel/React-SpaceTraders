import accountAxios from "services/accountAxios";

type RegisterAgentPayload = {
    symbol: string;
    faction: string;
};

const getAccount = () => accountAxios.get("/my/account");

const registerAgent = (payload: RegisterAgentPayload) => {
    return accountAxios.post("/register", payload);
};

export { getAccount, registerAgent };
