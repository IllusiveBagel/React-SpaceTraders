// Automation logic is now handled by the backend.
// This context is for UI management only.
import { createContext } from "react";
import type { AutomationContextValue } from "./types";
const AutomationContext = createContext<AutomationContextValue | undefined>(
    undefined,
);
export { AutomationContext };
