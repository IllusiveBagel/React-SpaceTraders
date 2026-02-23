type AutomationMode = "mine_and_sell" | "contract_jobs";

type MiningAutomationConfig = {
    shipSymbol: string;
    mode: AutomationMode;
    mineWaypoint: string;
    marketWaypoint: string;
    tradeSymbol: string;
    sellAtUnits: number;
    intervalSeconds: number;
};

type AutomationStatus = {
    lastAction?: string;
    lastError?: string;
    lastUpdated?: string;
    errorCount?: number;
    backoffUntil?: string;
    recentActions?: AutomationLogEntry[];
};

type AutomationLogEntry = {
    message: string;
    timestamp: string;
    type: "action" | "error" | "system";
};

type AutomationMap<T> = Record<string, T>;

type AutomationContextValue = {
    configs: AutomationMap<MiningAutomationConfig>;
    running: AutomationMap<boolean>;
    status: AutomationMap<AutomationStatus>;
    upsertConfig: (config: MiningAutomationConfig) => void;
    startAutomation: (shipSymbol: string) => void;
    stopAutomation: (shipSymbol: string) => void;
    stopAll: () => void;
};

export type {
    AutomationContextValue,
    AutomationMap,
    AutomationStatus,
    AutomationLogEntry,
    MiningAutomationConfig,
    AutomationMode,
};
