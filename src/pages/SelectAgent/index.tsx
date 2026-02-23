import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import useRegisterAgent from "hooks/account/useRegisterAgent";
import axiosManager from "services/axiosManager";
import { clearAgentToken, setAgentToken } from "services/tokenStore";

import styles from "./SelectAgent.module.css";

const normalizeSymbol = (value: string) => value.trim().toUpperCase();

const SelectAgent = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const registerAgent = useRegisterAgent();

    const [showCreate, setShowCreate] = useState(true);
    const [callsign, setCallsign] = useState("");
    const [faction, setFaction] = useState("COSMIC");
    const [existingToken, setExistingToken] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [isTokenPending, setIsTokenPending] = useState(false);

    const handleUseToken = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        const token = existingToken.trim();
        if (!token) {
            setFormError("Agent token is required.");
            return;
        }

        setIsTokenPending(true);
        setAgentToken(token);

        try {
            await axiosManager.get("/my/agent");
            queryClient.clear();
            navigate("/");
        } catch (err) {
            clearAgentToken();
            const message =
                err instanceof Error ? err.message : "Invalid agent token.";
            setFormError(message);
        } finally {
            setIsTokenPending(false);
        }
    };

    const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        const payload = {
            symbol: normalizeSymbol(callsign),
            faction: normalizeSymbol(faction),
        };

        if (!payload.symbol) {
            setFormError("Callsign is required.");
            return;
        }

        try {
            const result = await registerAgent.mutateAsync(payload);
            setAgentToken(result.token);
            queryClient.clear();
            navigate("/");
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to create agent.";
            setFormError(message);
        }
    };

    const errorMessage = formError;

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>Select your agent</h1>
                    <p>Use an existing agent token or create a new agent.</p>
                </div>

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
                            onChange={(event) => setFaction(event.target.value)}
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
            </div>
        </div>
    );
};

export default SelectAgent;
