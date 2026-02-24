import axios from "axios";

const apiBaseUrl =
    process.env.SPACETRADERS_API_BASE_URL || "https://api.spacetraders.io/v2";

const spaceTradersClient = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15_000,
});

const validateAgentToken = async (token) => {
    const response = await spaceTradersClient.get("/my/agent", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data?.data;
};

export { apiBaseUrl, validateAgentToken };
