type MiningAutomationConfig = {
    shipSymbol: string;
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
    MiningAutomationConfig,
};
