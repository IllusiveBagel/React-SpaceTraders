import axios, { type AxiosInstance } from "axios";

const authToken = import.meta.env.VITE_AUTH_TOKEN as string | undefined;
const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

const axiosManager: AxiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosManager.interceptors.request.use((config) => {
    if (authToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
});

export default axiosManager;
