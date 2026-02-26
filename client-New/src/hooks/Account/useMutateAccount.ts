import { useMutation } from "@tanstack/react-query";
import { registerAgent } from "services/Account/accountMutationService";
import type { Agent } from "types/Agent";
import type { Contract } from "types/Contract";
import type { Faction, FactionSymbol } from "types/Faction";
import type { Ship } from "types/Ship";
import { useSpaceTradersStore } from "../../store/spaceTradersStore";

const useMutateAccount = () => {
    const setAgent = useSpaceTradersStore((state) => state.setAgent);
    const setShips = useSpaceTradersStore((state) => state.setShips);

    const registerAgentMutation = useMutation({
        mutationKey: ["registerAgent"],
        mutationFn: async ({
            symbol,
            faction,
        }: {
            symbol: string;
            faction: FactionSymbol;
        }) => {
            const response = (await registerAgent(symbol, faction)).data
                .data as {
                token: string;
                agent: Agent;
                faction: Faction;
                contract: Contract;
                ships: Ship[];
            };

            setAgent(response.agent);
            setShips(response.ships);

            return response;
        },
    });

    return { registerAgent: registerAgentMutation };
};

export default useMutateAccount;
