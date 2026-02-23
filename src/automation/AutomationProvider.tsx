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
    jettisonCargo,
    navigateShip,
    orbitShip,
    refuelShip,
    sellCargo,
} from "services/shipActions";
import { deliverContract, fulfillContract } from "services/contractActions";
import { runAutomationStep } from "./automationEngine";
import { AutomationContext } from "./AutomationContext";
import type {
    AutomationContextValue,
    AutomationLogEntry,
    AutomationMap,
    AutomationRunState,
    AutomationStatus,
    MiningAutomationConfig,
} from "./types";
import type { Ship } from "types/fleet";
import type { Contract } from "types/contract";

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
    const queryClient = useQueryClient();
    const [configs, setConfigs] = useState<
        AutomationMap<MiningAutomationConfig>
    >(() => readConfigs());
    const [runState, setRunState] = useState<AutomationMap<AutomationRunState>>(
        () => readRunState(),
    );
    const [status, setStatus] = useState<AutomationMap<AutomationStatus>>(() =>
        readMap<AutomationStatus>(STATUS_KEY),
    );
    const timersRef = useRef<AutomationMap<number>>({});
    const inFlightRef = useRef<AutomationMap<boolean>>({});
    const backoffRef = useRef<
        AutomationMap<{ attempts: number; nextRunAt: number }>
    >({});

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
        (shipSymbol: string) => {
            setState(shipSymbol, "stopped");
            const timer = timersRef.current[shipSymbol];
            if (timer) {
                window.clearInterval(timer);
                delete timersRef.current[shipSymbol];
            }
            delete backoffRef.current[shipSymbol];
        },
        [setState],
    );

    const pauseAutomation = useCallback(
        (shipSymbol: string) => {
            setState(shipSymbol, "paused");
            const timer = timersRef.current[shipSymbol];
            if (timer) {
                window.clearInterval(timer);
                delete timersRef.current[shipSymbol];
            }
        },
        [setState],
    );

    const resumeAutomation = useCallback(
        (shipSymbol: string) => {
            setState(shipSymbol, "running");
        },
        [setState],
    );

    const stopAll = useCallback(() => {
        setRunState({});
        Object.values(timersRef.current).forEach((timer) => {
            window.clearInterval(timer);
        });
        timersRef.current = {};
        backoffRef.current = {};
    }, []);

    const startAutomation = useCallback(
        (shipSymbol: string) => {
            setState(shipSymbol, "running");
        },
        [setState],
    );

    const recordStatus = useCallback(
        (
            shipSymbol: string,
            update: AutomationStatus,
            logEntry?: AutomationLogEntry,
        ) => {
            setStatus((prev) => {
                const current = prev[shipSymbol] ?? {};
                const history = current.recentActions ?? [];
                const nextHistory = logEntry
                    ? [logEntry, ...history].slice(0, 12)
                    : history;

                return {
                    ...prev,
                    [shipSymbol]: {
                        ...current,
                        ...update,
                        recentActions: nextHistory,
                    },
                };
            });
        },
        [],
    );

    const fetchShip = useCallback(async (shipSymbol: string) => {
        const response = await axiosManager.get(`/my/ships/${shipSymbol}`);
        return response.data.data as Ship;
    }, []);

    const fetchContracts = useCallback(async () => {
        const response = await axiosManager.get("/my/contracts");
        return response.data.data as Contract[];
    }, []);

    const resetBackoff = useCallback((shipSymbol: string) => {
        if (backoffRef.current[shipSymbol]) {
            delete backoffRef.current[shipSymbol];
        }
    }, []);

    const scheduleBackoff = useCallback(
        (shipSymbol: string, config: MiningAutomationConfig) => {
            const current = backoffRef.current[shipSymbol];
            const attempts = (current?.attempts ?? 0) + 1;
            const baseSeconds = Math.max(5, config.intervalSeconds || 5);
            const delaySeconds = Math.min(300, baseSeconds * 2 ** attempts);
            const nextRunAt = Date.now() + delaySeconds * 1000;

            backoffRef.current[shipSymbol] = {
                attempts,
                nextRunAt,
            };

            const timestamp = new Date().toISOString();
            recordStatus(
                shipSymbol,
                {
                    lastAction: `Backing off for ${delaySeconds}s.`,
                    lastUpdated: timestamp,
                    errorCount: attempts,
                    backoffUntil: new Date(nextRunAt).toISOString(),
                },
                {
                    message: `Backing off for ${delaySeconds}s.`,
                    timestamp,
                    type: "system",
                    result: "system",
                },
            );
        },
        [recordStatus],
    );

    const runTick = useCallback(
        async (shipSymbol: string) => {
            if (inFlightRef.current[shipSymbol]) {
                return;
            }

            const config = configs[shipSymbol];
            if (!config) {
                const timestamp = new Date().toISOString();
                recordStatus(
                    shipSymbol,
                    {
                        lastError: "Missing automation config.",
                        lastUpdated: timestamp,
                    },
                    {
                        message: "Missing automation config.",
                        timestamp,
                        type: "system",
                        result: "system",
                        durationMs: 0,
                    },
                );
                return;
            }

            const backoff = backoffRef.current[shipSymbol];
            if (backoff && Date.now() < backoff.nextRunAt) {
                return;
            }

            inFlightRef.current[shipSymbol] = true;
            const startedAt = Date.now();

            try {
                const ship = await fetchShip(shipSymbol);
                const fuelCapacity = ship.fuel.capacity || 0;
                const minFuelPercent = config.minFuelPercent ?? 15;
                if (fuelCapacity > 0) {
                    const fuelPercent =
                        (ship.fuel.current / fuelCapacity) * 100;
                    if (fuelPercent < minFuelPercent) {
                        if (config.autoRefuel) {
                            if (ship.nav.status === "IN_ORBIT") {
                                await dockShip(shipSymbol);
                            }
                            await refuelShip(shipSymbol);
                            const timestamp = new Date().toISOString();
                            recordStatus(
                                shipSymbol,
                                {
                                    lastAction: "Auto-refueled ship.",
                                    lastUpdated: timestamp,
                                },
                                {
                                    message: "Auto-refueled ship.",
                                    timestamp,
                                    type: "action",
                                    action: "refuel",
                                    durationMs: Date.now() - startedAt,
                                    result: "success",
                                },
                            );
                            return;
                        }
                        const timestamp = new Date().toISOString();
                        recordStatus(
                            shipSymbol,
                            {
                                lastAction: `Fuel below ${minFuelPercent}%.`,
                                lastUpdated: timestamp,
                            },
                            {
                                message: `Fuel below ${minFuelPercent}%.`,
                                timestamp,
                                type: "system",
                                result: "system",
                                durationMs: Date.now() - startedAt,
                            },
                        );
                        return;
                    }
                }

                if (typeof config.minCargoFreeUnits === "number") {
                    const freeUnits = Math.max(
                        0,
                        ship.cargo.capacity - ship.cargo.units,
                    );
                    if (freeUnits < config.minCargoFreeUnits) {
                        const timestamp = new Date().toISOString();
                        recordStatus(
                            shipSymbol,
                            {
                                lastAction: `Cargo space below ${config.minCargoFreeUnits} units.`,
                                lastUpdated: timestamp,
                            },
                            {
                                message: `Cargo space below ${config.minCargoFreeUnits} units.`,
                                timestamp,
                                type: "system",
                                result: "system",
                                durationMs: Date.now() - startedAt,
                            },
                        );
                        return;
                    }
                }

                const contracts =
                    config.mode === "contract_jobs"
                        ? await fetchContracts()
                        : [];
                const decision = await runAutomationStep(
                    ship,
                    config,
                    contracts,
                    {
                        dock: () => dockShip(shipSymbol),
                        orbit: () => orbitShip(shipSymbol),
                        navigate: (waypointSymbol: string) =>
                            navigateShip(shipSymbol, waypointSymbol),
                        extract: () => extractResources(shipSymbol),
                        sell: (symbol: string, units: number) =>
                            sellCargo(shipSymbol, symbol, units),
                        jettison: (symbol: string, units: number) =>
                            jettisonCargo(shipSymbol, symbol, units),
                        deliver: (
                            contractId,
                            shipSymbolArg,
                            tradeSymbol,
                            units,
                        ) =>
                            deliverContract(contractId, {
                                shipSymbol: shipSymbolArg,
                                tradeSymbol,
                                units,
                            }),
                        fulfill: (contractId) => fulfillContract(contractId),
                    },
                );

                const timestamp = new Date().toISOString();
                const durationMs = Date.now() - startedAt;
                recordStatus(
                    shipSymbol,
                    {
                        lastAction: decision.message,
                        lastError: undefined,
                        lastUpdated: timestamp,
                        errorCount: 0,
                        backoffUntil: undefined,
                    },
                    {
                        message: decision.message,
                        timestamp,
                        type: "action",
                        action: decision.action,
                        durationMs,
                        result: "success",
                    },
                );

                resetBackoff(shipSymbol);

                queryClient.invalidateQueries({
                    queryKey: ["ship", shipSymbol],
                });
                queryClient.invalidateQueries({ queryKey: ["ships"] });
                if (config.mode === "contract_jobs") {
                    queryClient.invalidateQueries({ queryKey: ["contracts"] });
                }
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Automation failed.";
                const timestamp = new Date().toISOString();
                const durationMs = Date.now() - startedAt;
                recordStatus(
                    shipSymbol,
                    {
                        lastError: message,
                        lastUpdated: timestamp,
                    },
                    {
                        message,
                        timestamp,
                        type: "error",
                        durationMs,
                        result: "error",
                    },
                );
                scheduleBackoff(shipSymbol, config);
            } finally {
                inFlightRef.current[shipSymbol] = false;
            }
        },
        [
            configs,
            fetchContracts,
            fetchShip,
            queryClient,
            recordStatus,
            resetBackoff,
            scheduleBackoff,
        ],
    );

    useEffect(() => {
        Object.entries(runState).forEach(([shipSymbol, state]) => {
            const config = configs[shipSymbol];
            if (state !== "running" || !config) {
                if (timersRef.current[shipSymbol]) {
                    window.clearInterval(timersRef.current[shipSymbol]);
                    delete timersRef.current[shipSymbol];
                }
                return;
            }

            if (timersRef.current[shipSymbol]) {
                return;
            }

            const intervalSeconds = Math.max(5, config.intervalSeconds || 5);
            const intervalMs = intervalSeconds * 1000;

            timersRef.current[shipSymbol] = window.setInterval(() => {
                runTick(shipSymbol);
            }, intervalMs);

            runTick(shipSymbol);
        });
    }, [configs, runState, runTick]);

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
