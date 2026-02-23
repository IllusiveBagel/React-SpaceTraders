import { useQuery } from "@tanstack/react-query";

import { getAccount } from "services/accountActions";
import type { Account } from "types/account";

const useGetAccount = () => {
    return useQuery<Account>({
        queryKey: ["account"],
        queryFn: async () => {
            const response = await getAccount();
            return response.data.data as Account;
        },
    });
};

export default useGetAccount;
