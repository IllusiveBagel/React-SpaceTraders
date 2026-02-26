import { createApiClient, getRuntimeEnv } from "services/axiosManager";

const runtimeEnv = getRuntimeEnv();
const backendBaseUrl =
    runtimeEnv?.VITE_BACKEND_BASE_URL ||
    (import.meta.env.VITE_BACKEND_BASE_URL as string | undefined) ||
    "/backend";

const isBackendConfigured = Boolean(backendBaseUrl);

const backendAxios = createApiClient({ baseURL: backendBaseUrl });

export { backendBaseUrl, isBackendConfigured };
export default backendAxios;
