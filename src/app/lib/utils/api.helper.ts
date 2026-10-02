import { getToken } from '@/lib/utils/token.helper';
import { isPathInRecoveryWhiteList } from '@/app/lib/constants/recoveryWhiteList';

export interface IOperationalHeaderOptions {
    recoveryMode?: boolean;
    recoveryVisibility?: 'deleted' | 'all';
}

export function getOperationalHeaders(
    customToken?: string,
    customCompanyId?: string,
    customBranchId?: string,
    options?: IOperationalHeaderOptions
): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    const token = customToken || getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let companyId = customCompanyId;
    if (!companyId && typeof window !== 'undefined') {
        const savedCompany = localStorage.getItem('currentCompany') || localStorage.getItem('erp_company_id');
        if (savedCompany) {
            try {
                if (savedCompany.startsWith('{')) {
                    companyId = JSON.parse(savedCompany)?.id;
                } else {
                    companyId = savedCompany;
                }
            } catch (e) {
                companyId = savedCompany;
            }
        }
    }
    if (companyId) {
        headers['X-Company-Id'] = companyId;
    }

    let branchId = customBranchId;
    if (!branchId && typeof window !== 'undefined') {
        const savedBranch = localStorage.getItem('currentBranch') || localStorage.getItem('erp_branch_id');
        if (savedBranch) {
            try {
                if (savedBranch.startsWith('{')) {
                    branchId = JSON.parse(savedBranch)?.id;
                } else {
                    branchId = savedBranch;
                }
            } catch (e) {
                branchId = savedBranch;
            }
        }
    }
    if (branchId) {
        headers['X-Branch-Id'] = branchId;
    }

    let isRecoveryOn = options?.recoveryMode;
    if (isRecoveryOn === undefined && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isRouteSupported = isPathInRecoveryWhiteList(currentPath);

        if (isRouteSupported) {
            const savedEnabled = localStorage.getItem('erp_recovery_enabled');
            const isEnabled = savedEnabled !== 'false';
            if (isEnabled) {
                const savedMode = localStorage.getItem('erp_recovery_mode');
                isRecoveryOn = savedMode === '1' || savedMode === 'true';
            } else {
                isRecoveryOn = false;
            }
        } else {
            isRecoveryOn = false;
        }
    }

    if (isRecoveryOn) {
        headers['X-Recovery-Mode'] = 'true';

        let visibility = options?.recoveryVisibility;
        if (!visibility && typeof window !== 'undefined') {
            const savedVis = localStorage.getItem('erp_recovery_visibility');
            if (savedVis === 'all' || savedVis === 'deleted') {
                visibility = savedVis as 'all' | 'deleted';
            }
        }
        headers['X-Recovery-Visibility'] = visibility || 'all';
    }

    return headers;
}
