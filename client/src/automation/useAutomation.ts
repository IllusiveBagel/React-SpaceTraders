import { useContext } from "react";

import { AutomationContext } from "./AutomationContext";

// Automation logic is now handled by the backend.
// This hook provides access to the automation management context for UI.
const useAutomation = () => {
    const context = useContext(AutomationContext);
    if (!context) {
        throw new Error("useAutomation must be used within AutomationProvider");
    }
    return context;
};

export default useAutomation;
