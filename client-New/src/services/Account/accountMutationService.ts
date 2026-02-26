import axiosManager from "services/axiosManager";
import type { FactionSymbol } from "types/Faction";

const registerAgent = (symbol: string, faction: FactionSymbol) => {
    return axiosManager.post("/register", {
        symbol,
        faction,
    });
};

export { registerAgent };
