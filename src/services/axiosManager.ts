import axios, { type AxiosInstance, type AxiosError } from "axios";

type RuntimeEnv = Record<string, string> | undefined;

const getRuntimeEnv = (): RuntimeEnv => {
    if (typeof window === "undefined") {
        return undefined;
    }

    return (window as Window & { __ENV?: RuntimeEnv }).__ENV;
};

const runtimeEnv = getRuntimeEnv();
const authToken =
    runtimeEnv?.VITE_AUTH_TOKEN ||
    (import.meta.env.VITE_AUTH_TOKEN as string | undefined);
const baseUrl =
    runtimeEnv?.VITE_API_BASE_URL ||
    (import.meta.env.VITE_API_BASE_URL as string | undefined);

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

axiosManager.interceptors.response.use(
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

export default axiosManager;
