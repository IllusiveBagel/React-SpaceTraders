import { useCallback, useEffect, useState, type ReactNode } from "react";

import axiosManager from "services/axiosManager";
import { AutomationContext } from "./AutomationContext";
import type {
    AutomationContextValue,
    AutomationMap,
    AutomationRunState,
    AutomationStatus,
    MiningAutomationConfig,
} from "./types";

const STORAGE_KEY = "spacetraders-automation-configs";
const RUNNING_KEY = "spacetraders-automation-running";
const RUN_STATE_KEY = "spacetraders-automation-run-state";
const STATUS_KEY = "spacetraders-automation-status";

const readMap = <T,>(key: string): AutomationMap<T> => {
    if (typeof window === "undefined") {
        return {};
    }

    const raw = window.localStorage.getItem(key);
    if (!raw) {
        return {};
    }

    try {
        return JSON.parse(raw) as AutomationMap<T>;
    } catch {
        return {};
    }
};

const readConfigs = (): AutomationMap<MiningAutomationConfig> => {
    if (typeof window === "undefined") {
        return {};
    }

    return readMap<MiningAutomationConfig>(STORAGE_KEY);
};

const readRunState = (): AutomationMap<AutomationRunState> => {
    if (typeof window === "undefined") {
        return {};
    }

    const runState = readMap<AutomationRunState>(RUN_STATE_KEY);
    if (Object.keys(runState).length > 0) {
        return runState;
    }

    const legacyRunning = readMap<boolean>(RUNNING_KEY);
    if (Object.keys(legacyRunning).length === 0) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(legacyRunning).map(([key, value]) => [
            key,
            value ? "running" : "stopped",
        ]),
    );
};

type AutomationProviderProps = {
    children: ReactNode;
};

const AutomationProvider = ({ children }: AutomationProviderProps) => {
    const [configs, setConfigs] = useState<
        AutomationMap<MiningAutomationConfig>
    >(() => readConfigs());
    const [runState, setRunState] = useState<AutomationMap<AutomationRunState>>(
        () => readRunState(),
    );
    const [status] = useState<AutomationMap<AutomationStatus>>(() =>
        readMap<AutomationStatus>(STATUS_KEY),
    );

    // Automation logic is now handled by the backend.
    // These refs are no longer needed.

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    }, [configs]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(RUN_STATE_KEY, JSON.stringify(runState));
    }, [runState]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(STATUS_KEY, JSON.stringify(status));
    }, [status]);

    const upsertConfig = useCallback((config: MiningAutomationConfig) => {
        setConfigs((prev) => ({ ...prev, [config.shipSymbol]: config }));
    }, []);

    const setState = useCallback(
        (shipSymbol: string, nextState: AutomationRunState) => {
            setRunState((prev) => ({ ...prev, [shipSymbol]: nextState }));
        },
        [],
    );

    const stopAutomation = useCallback(
        async (shipSymbol: string) => {
            setState(shipSymbol, "stopped");
            // Notify backend to stop automation for this ship
            await axiosManager.post(`/automation/stop`, { shipSymbol });
        },
        [setState],
    );

    const pauseAutomation = useCallback(
        async (shipSymbol: string) => {
            setState(shipSymbol, "paused");
            // Notify backend to pause automation for this ship
            await axiosManager.post(`/automation/pause`, { shipSymbol });
        },
        [setState],
    );

    const resumeAutomation = useCallback(
        async (shipSymbol: string) => {
            setState(shipSymbol, "running");
            // Notify backend to resume automation for this ship
            await axiosManager.post(`/automation/resume`, { shipSymbol });
        },
        [setState],
    );

    const stopAll = useCallback(async () => {
        setRunState({});
        // Notify backend to stop all automation
        await axiosManager.post(`/automation/stopAll`);
    }, []);

    const startAutomation = useCallback(
        async (shipSymbol: string) => {
            setState(shipSymbol, "running");
            // Notify backend to start automation for this ship
            await axiosManager.post(`/automation/start`, { shipSymbol });
        },
        [setState],
    );

    // useEffect for local automation intervals is removed. Backend is responsible for automation execution.

    const value: AutomationContextValue = {
        configs,
        runState,
        status,
        upsertConfig,
        startAutomation,
        pauseAutomation,
        resumeAutomation,
        stopAutomation,
        stopAll,
    };

    return (
        <AutomationContext.Provider value={value}>
            {children}
        </AutomationContext.Provider>
    );
};

export { AutomationProvider };
