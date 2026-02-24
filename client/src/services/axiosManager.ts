import axios, { type AxiosInstance, type AxiosError } from "axios";

import { getAgentToken } from "services/tokenStore";

type RuntimeEnv = Record<string, string> | undefined;

const getRuntimeEnv = (): RuntimeEnv => {
    if (typeof window === "undefined") {
        return undefined;
    }

    return (window as Window & { __ENV?: RuntimeEnv }).__ENV;
};

const runtimeEnv = getRuntimeEnv();
const baseUrl =
    runtimeEnv?.VITE_API_BASE_URL ||
    (import.meta.env.VITE_API_BASE_URL as string | undefined);

type CreateApiClientOptions = {
    getToken?: () => string | undefined;
    baseURL?: string;
};

type ApiErrorShape = {
    error?: {
        message?: string;
        code?: string;
        data?: unknown;
    };
    message?: string;
};

const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorShape>;
        const responseData = axiosError.response?.data;
        const message =
            responseData?.error?.message ||
            responseData?.message ||
            axiosError.message ||
            "Request failed.";

        return {
            message,
            status: axiosError.response?.status,
            data: responseData,
        };
    }

    if (error instanceof Error) {
        return { message: error.message };
    }

    return { message: "Request failed." };
};

const createApiClient = (options?: CreateApiClientOptions) => {
    const { getToken, baseURL } = options ?? {};

    const client: AxiosInstance = axios.create({
        baseURL: baseURL ?? baseUrl,
        headers: {
            "Content-Type": "application/json",
        },
    });

    client.interceptors.request.use((config) => {
        const token = getToken?.();

        if (token && !config.headers?.Authorization) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    });

    client.interceptors.response.use(
        (response) => response,
        (error) => {
            const { message, status, data } = getErrorMessage(error);
            const formattedError = new Error(message) as Error & {
                status?: number;
                data?: unknown;
            };

            formattedError.status = status;
            formattedError.data = data;

            return Promise.reject(formattedError);
        },
    );

    return client;
};

const axiosManager = createApiClient({ getToken: () => getAgentToken() });

const apiBaseUrl = baseUrl;

export { createApiClient, getRuntimeEnv };
export default axiosManager;
export { apiBaseUrl };
