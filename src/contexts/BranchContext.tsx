'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { IFBranch } from "@repo/api-contracts/erp";
import { branchesService } from '@repo/erp-services/userContext/branches.service';
import { useAuth } from './AuthContext';

interface BranchContextType {
    branches: IFBranch[];
    currentBranch: IFBranch | null;
    changeBranch: (branch: IFBranch | null) => Promise<void>;
    loadingBranches: boolean;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
    const { token, currentCompany, profileContext, refreshProfileContext, isAuthenticated } = useAuth();
    const [branches, setBranches] = useState<IFBranch[]>([]);
    const [currentBranch, setCurrentBranch] = useState<IFBranch | null>(null);
    const [loadingBranches, setLoadingBranches] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;
        const fetchBranches = async () => {
            if (!isAuthenticated || !token || !currentCompany?.id) {
                if (isMounted) {
                    setBranches([]);
                    setCurrentBranch(null);
                    setLoadingBranches(false);
                }
                return;
            }

            setLoadingBranches(true);
            try {
                const res = await branchesService.getAll({ company_id: currentCompany.id, limit: 500 }, token);
                let fetchedBranches = res.items || [];

                if (profileContext?.branchAccessMode === 'restricted' && profileContext.allowedBranchIds) {
                    const allowedSet = new Set(profileContext.allowedBranchIds.map(id => String(id)));
                    fetchedBranches = fetchedBranches.filter(b => allowedSet.has(String(b.id)));
                }

                if (isMounted) {
                    setBranches(fetchedBranches);

                    const savedBranch = localStorage.getItem('currentBranch');
                    let selected: IFBranch | null = null;

                    if (savedBranch) {
                        try {
                            const parsed: IFBranch = JSON.parse(savedBranch);
                            selected = fetchedBranches.find(b => String(b.id) === String(parsed.id)) || null;
                        } catch (e) {
                            console.error('Error parsing stored currentBranch:', e);
                        }
                    }

                    if (!selected && fetchedBranches.length > 0) {
                        selected = fetchedBranches[0];
                    }

                    setCurrentBranch(selected);
                    if (selected) {
                        localStorage.setItem('currentBranch', JSON.stringify(selected));
                        localStorage.setItem('erp_branch_id', selected.id);
                    } else {
                        localStorage.removeItem('currentBranch');
                        localStorage.removeItem('erp_branch_id');
                    }
                }
            } catch (err) {
                console.error('Error fetching branches for context:', err);
                if (isMounted) {
                    setBranches([]);
                    setCurrentBranch(null);
                }
            } finally {
                if (isMounted) setLoadingBranches(false);
            }
        };

        fetchBranches();

        return () => { isMounted = false; };
    }, [isAuthenticated, token, currentCompany?.id, profileContext?.branchAccessMode]);

    const changeBranch = async (branch: IFBranch | null) => {
        setCurrentBranch(branch);
        if (branch) {
            localStorage.setItem('currentBranch', JSON.stringify(branch));
            localStorage.setItem('erp_branch_id', branch.id);
        } else {
            localStorage.removeItem('currentBranch');
            localStorage.removeItem('erp_branch_id');
        }

        if (currentCompany?.id) {
            await refreshProfileContext(currentCompany.id, branch?.id || undefined);
        }
    };

    return (
        <BranchContext.Provider value={{
            branches,
            currentBranch,
            changeBranch,
            loadingBranches,
        }}>
            {children}
        </BranchContext.Provider>
    );
}

export function useBranch() {
    const context = useContext(BranchContext);
    if (context === undefined) {
        throw new Error('useBranch must be used within a BranchProvider');
    }
    return context;
}
