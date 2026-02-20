import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import axiosManager from "services/axiosManager";
import {
    dockShip,
    extractResources,
    navigateShip,
    orbitShip,
    sellCargo,
} from "services/shipActions";
import { runMiningAutomationStep } from "./automationEngine";
import { AutomationContext } from "./AutomationContext";
import type {
    AutomationContextValue,
    AutomationMap,
    AutomationStatus,
    MiningAutomationConfig,
} from "./types";
import type { Ship } from "types/fleet";

const STORAGE_KEY = "spacetraders-automation-configs";
const RUNNING_KEY = "spacetraders-automation-running";
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

type AutomationProviderProps = {
    children: ReactNode;
};

const AutomationProvider = ({ children }: AutomationProviderProps) => {
    const queryClient = useQueryClient();
    const [configs, setConfigs] = useState<
        AutomationMap<MiningAutomationConfig>
    >(() => readConfigs());
    const [running, setRunning] = useState<AutomationMap<boolean>>(() =>
        readMap<boolean>(RUNNING_KEY),
    );
    const [status, setStatus] = useState<AutomationMap<AutomationStatus>>(() =>
        readMap<AutomationStatus>(STATUS_KEY),
    );
    const timersRef = useRef<AutomationMap<number>>({});
    const inFlightRef = useRef<AutomationMap<boolean>>({});

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

        window.localStorage.setItem(RUNNING_KEY, JSON.stringify(running));
    }, [running]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(STATUS_KEY, JSON.stringify(status));
    }, [status]);

    const upsertConfig = useCallback((config: MiningAutomationConfig) => {
        setConfigs((prev) => ({ ...prev, [config.shipSymbol]: config }));
    }, []);

    const stopAutomation = useCallback((shipSymbol: string) => {
        setRunning((prev) => ({ ...prev, [shipSymbol]: false }));
        const timer = timersRef.current[shipSymbol];
        if (timer) {
            window.clearInterval(timer);
            delete timersRef.current[shipSymbol];
        }
    }, []);

    const stopAll = useCallback(() => {
        setRunning({});
        Object.values(timersRef.current).forEach((timer) => {
            window.clearInterval(timer);
        });
        timersRef.current = {};
    }, []);

    const startAutomation = useCallback((shipSymbol: string) => {
        setRunning((prev) => ({ ...prev, [shipSymbol]: true }));
    }, []);

    const updateStatus = useCallback(
        (shipSymbol: string, update: AutomationStatus) => {
            setStatus((prev) => ({
                ...prev,
                [shipSymbol]: {
                    ...prev[shipSymbol],
                    ...update,
                },
            }));
        },
        [],
    );

    const fetchShip = useCallback(async (shipSymbol: string) => {
        const response = await axiosManager.get(`/my/ships/${shipSymbol}`);
        return response.data.data as Ship;
    }, []);

    const runTick = useCallback(
        async (shipSymbol: string) => {
            if (inFlightRef.current[shipSymbol]) {
                return;
            }

            const config = configs[shipSymbol];
            if (!config) {
                updateStatus(shipSymbol, {
                    lastError: "Missing automation config.",
                    lastUpdated: new Date().toISOString(),
                });
                return;
            }

            inFlightRef.current[shipSymbol] = true;

            try {
                const ship = await fetchShip(shipSymbol);
                const decision = await runMiningAutomationStep(ship, config, {
                    dock: () => dockShip(shipSymbol),
                    orbit: () => orbitShip(shipSymbol),
                    navigate: (waypointSymbol: string) =>
                        navigateShip(shipSymbol, waypointSymbol),
                    extract: () => extractResources(shipSymbol),
                    sell: (symbol: string, units: number) =>
                        sellCargo(shipSymbol, symbol, units),
                });

                updateStatus(shipSymbol, {
                    lastAction: decision.message,
                    lastError: undefined,
                    lastUpdated: new Date().toISOString(),
                });

                queryClient.invalidateQueries({
                    queryKey: ["ship", shipSymbol],
                });
                queryClient.invalidateQueries({ queryKey: ["ships"] });
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Automation failed.";
                updateStatus(shipSymbol, {
                    lastError: message,
                    lastUpdated: new Date().toISOString(),
                });
            } finally {
                inFlightRef.current[shipSymbol] = false;
            }
        },
        [configs, fetchShip, queryClient, updateStatus],
    );

    useEffect(() => {
        Object.entries(running).forEach(([shipSymbol, isRunning]) => {
            const config = configs[shipSymbol];
            if (!isRunning || !config) {
                if (timersRef.current[shipSymbol]) {
                    window.clearInterval(timersRef.current[shipSymbol]);
                    delete timersRef.current[shipSymbol];
                }
                return;
            }

            if (timersRef.current[shipSymbol]) {
                return;
            }

            const intervalMs = Math.max(5, config.intervalSeconds) * 1000;
            timersRef.current[shipSymbol] = window.setInterval(() => {
                runTick(shipSymbol);
            }, intervalMs);

            runTick(shipSymbol);
        });
    }, [configs, runTick, running]);

    const value: AutomationContextValue = {
        configs,
        running,
        status,
        upsertConfig,
        startAutomation,
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
