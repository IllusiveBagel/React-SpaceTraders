import { createApiClient, getRuntimeEnv } from "services/axiosManager";

const runtimeEnv = getRuntimeEnv();
const accountToken =
    runtimeEnv?.VITE_ACCOUNT_TOKEN ||
    (import.meta.env.VITE_ACCOUNT_TOKEN as string | undefined);

const accountAxios = createApiClient(() => accountToken);

export default accountAxios;
