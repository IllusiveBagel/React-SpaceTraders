import { createContext } from "react";

import type { AutomationContextValue } from "./types";

const AutomationContext = createContext<AutomationContextValue | undefined>(
    undefined,
);

export { AutomationContext };
