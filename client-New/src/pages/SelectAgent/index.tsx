import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { isBackendConfigured } from "services/backendAxios";
import {
    connectStoredAgent,
    listStoredAgents,
    storeAgentToken,
} from "services/backendAgentStore";
import axiosManager from "services/axiosManager";
import { clearAgentToken, setAgentToken } from "services/tokenStore";

import useMutateAccount from "hooks/Account/useMutateAccount";

import styles from "./SelectAgent.module.css";
import type { FactionSymbol } from "types/Faction";

const normalizeSymbol = (value: string) => value.trim().toUpperCase();

const SelectAgent = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { registerAgent } = useMutateAccount();

    const [showCreate, setShowCreate] = useState(true);
    const [callsign, setCallsign] = useState("");
    const [faction, setFaction] = useState<FactionSymbol>("COSMIC");
    const [existingToken, setExistingToken] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const [isTokenPending, setIsTokenPending] = useState(false);
    const [connectingAgentSymbol, setConnectingAgentSymbol] = useState<
        string | null
    >(null);

    const storedAgentsQuery = useQuery({
        queryKey: ["backend", "stored-agents"],
        queryFn: listStoredAgents,
        enabled: isBackendConfigured,
        staleTime: 30_000,
    });

    const getErrorMessage = (error: unknown, fallback: string) => {
        if (error instanceof Error) {
            return error.message;
        }

        return fallback;
    };

    const navigateToHome = () => {
        queryClient.clear();
        navigate("/");
    };

    const persistTokenInBackend = async (token: string) => {
        if (!isBackendConfigured) {
            return;
        }

        await storeAgentToken(token);
    };

    const handleConnectStoredAgent = async (symbol: string) => {
        setFormError(null);
        setSaveStatus(null);
        setConnectingAgentSymbol(symbol);

        try {
            const result = await connectStoredAgent(symbol);
            setAgentToken(result.token);
            await axiosManager.get("/my/agent");
            setSaveStatus(`Connected to saved agent ${result.symbol}.`);
            navigateToHome();
        } catch (error) {
            clearAgentToken();
            setFormError(
                getErrorMessage(error, "Failed to connect saved agent."),
            );
        } finally {
            setConnectingAgentSymbol(null);
        }
    };

    const handleUseToken = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);
        setSaveStatus(null);

        const token = existingToken.trim();
        if (!token) {
            setFormError("Agent token is required.");
            return;
        }

        setIsTokenPending(true);
        setAgentToken(token);

        try {
            await axiosManager.get("/my/agent");
        } catch (err) {
            clearAgentToken();
            setFormError(getErrorMessage(err, "Invalid agent token."));
            setIsTokenPending(false);
            return;
        }

        try {
            await persistTokenInBackend(token);
            if (isBackendConfigured) {
                setSaveStatus("Agent token saved in backend.");
                await queryClient.invalidateQueries({
                    queryKey: ["backend", "stored-agents"],
                });
            }
            navigateToHome();
        } catch (err) {
            setFormError(
                getErrorMessage(
                    err,
                    "Connected to SpaceTraders, but failed to save token in backend.",
                ),
            );
        } finally {
            setIsTokenPending(false);
        }
    };

    const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);
        setSaveStatus(null);

        const payload = {
            symbol: normalizeSymbol(callsign),
            faction: normalizeSymbol(faction) as FactionSymbol,
        };

        if (!payload.symbol) {
            setFormError("Callsign is required.");
            return;
        }

        try {
            const result = await registerAgent.mutateAsync(payload);
            setAgentToken(result.token);
            await persistTokenInBackend(result.token);
            if (isBackendConfigured) {
                setSaveStatus("Agent token saved in backend.");
                await queryClient.invalidateQueries({
                    queryKey: ["backend", "stored-agents"],
                });
            }
            navigateToHome();
        } catch (err) {
            setFormError(
                getErrorMessage(
                    err,
                    "Failed to create agent or save token in backend.",
                ),
            );
        }
    };

    const errorMessage = formError;
    const storedAgents = storedAgentsQuery.data ?? [];
    const isStoredAgentPending = Boolean(connectingAgentSymbol);

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>Select your agent</h1>
                    <p>Use an existing agent token or create a new agent.</p>
                </div>

                {isBackendConfigured && (
                    <div className={styles.section}>
                        <h2>Saved agents</h2>
                        {storedAgentsQuery.isLoading && (
                            <div className={styles.status}>
                                Loading saved agents...
                            </div>
                        )}
                        {!storedAgentsQuery.isLoading &&
                            !storedAgentsQuery.isError &&
                            storedAgents.length === 0 && (
                                <div className={styles.status}>
                                    No saved agents yet.
                                </div>
                            )}
                        {storedAgentsQuery.isError && (
                            <div className={styles.status}>
                                Failed to load saved agents.
                            </div>
                        )}
                        {storedAgents.length > 0 && (
                            <div className={styles.agentList}>
                                {storedAgents.map((agent) => {
                                    const isPending =
                                        connectingAgentSymbol === agent.symbol;

                                    return (
                                        <button
                                            key={agent.symbol}
                                            type="button"
                                            className={styles.agentButton}
                                            onClick={() =>
                                                handleConnectStoredAgent(
                                                    agent.symbol,
                                                )
                                            }
                                            disabled={
                                                isStoredAgentPending ||
                                                isTokenPending ||
                                                registerAgent.isPending
                                            }
                                        >
                                            {isPending
                                                ? "Connecting..."
                                                : agent.symbol}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                <form className={styles.section} onSubmit={handleUseToken}>
                    <h2>Use agent token</h2>
                    <label className={styles.label} htmlFor="agentToken">
                        Agent token
                    </label>
                    <input
                        id="agentToken"
                        className={styles.input}
                        value={existingToken}
                        onChange={(event) =>
                            setExistingToken(event.target.value)
                        }
                        placeholder="Paste your agent token"
                    />
                    <button
                        type="submit"
                        className={styles.primaryButton}
                        disabled={isTokenPending}
                    >
                        {isTokenPending ? "Connecting..." : "Use token"}
                    </button>
                </form>

                <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => setShowCreate((prev) => !prev)}
                >
                    {showCreate ? "Hide create form" : "Create new agent"}
                </button>

                {showCreate && (
                    <form className={styles.section} onSubmit={handleCreate}>
                        <h2>Create agent</h2>
                        <label className={styles.label} htmlFor="callsign">
                            Callsign
                        </label>
                        <input
                            id="callsign"
                            className={styles.input}
                            value={callsign}
                            onChange={(event) =>
                                setCallsign(event.target.value)
                            }
                            placeholder="e.g. STARFOX"
                        />
                        <label className={styles.label} htmlFor="faction">
                            Faction
                        </label>
                        <input
                            id="faction"
                            className={styles.input}
                            value={faction}
                            onChange={(event) =>
                                setFaction(event.target.value as FactionSymbol)
                            }
                            placeholder="e.g. COSMIC"
                        />
                        <button
                            type="submit"
                            className={styles.primaryButton}
                            disabled={registerAgent.isPending}
                        >
                            {registerAgent.isPending
                                ? "Creating..."
                                : "Create agent"}
                        </button>
                    </form>
                )}

                {errorMessage && (
                    <div className={styles.error}>{errorMessage}</div>
                )}
                {saveStatus && (
                    <div className={styles.success}>{saveStatus}</div>
                )}
            </div>
        </div>
    );
};

export default SelectAgent;
