import { IFAccountNode } from "@repo/api-contracts/erp";
import { useAccounting } from '@/contexts/AccountingContext';
import { useMemo } from 'react';


export const useAccountBreadcrumbs = (accountId: string | null): IFAccountNode[] => {
    const { getAccountById } = useAccounting();

    return useMemo(() => {
        if (!accountId) return [];

        const path: IFAccountNode[] = [];
        let current = getAccountById(accountId);

        while (current) {
            path.unshift(current);
            if (!current.parentId) break;
            current = getAccountById(current.parentId);
        }

        return path;
    }, [accountId, getAccountById]);
};
