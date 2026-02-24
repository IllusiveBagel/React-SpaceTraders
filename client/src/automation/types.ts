type AutomationMode = "mine_and_sell" | "contract_jobs";

type AutomationTemplateId = "mining_loop" | "contract_fulfillment";

type AutomationTemplate = {
    id: AutomationTemplateId;
    label: string;
    description: string;
    mode: AutomationMode;
};

type AutomationRunState = "running" | "paused" | "stopped";

type MiningAutomationConfig = {
    shipSymbol: string;
    mode: AutomationMode;
    templateId?: AutomationTemplateId;
    mineWaypoint: string;
    marketWaypoint: string;
    tradeSymbol: string;
    sellAtUnits: number;
    intervalSeconds: number;
    minFuelPercent?: number;
    minCargoFreeUnits?: number;
    autoRefuel?: boolean;
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
    action?: string;
    durationMs?: number;
    result?: "success" | "error" | "system";
};

type AutomationMap<T> = Record<string, T>;

type AutomationContextValue = {
    configs: AutomationMap<MiningAutomationConfig>;
    runState: AutomationMap<AutomationRunState>;
    status: AutomationMap<AutomationStatus>;
    upsertConfig: (config: MiningAutomationConfig) => void;
    startAutomation: (shipSymbol: string) => void;
    pauseAutomation: (shipSymbol: string) => void;
    resumeAutomation: (shipSymbol: string) => void;
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
    AutomationTemplate,
    AutomationTemplateId,
    AutomationRunState,
};
