'use client';

import '@/lib/erp-api-client.setup';
import { createContext, ReactNode, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { isPathInRecoveryWhiteList } from '@/app/lib/constants/recoveryWhiteList';

interface RecoveryContextType {
    isRecoveryMode: boolean;
    recoveryVisibility: 'deleted' | 'all';
    canUseRecovery: boolean;
    recoveryEnabled: boolean;
    isRouteSupported: boolean;
    setRecoveryEnabled: (enabled: boolean) => void;
    enableRecovery: () => void;
    disableRecovery: () => void;
    toggleRecoveryMode: (on?: boolean) => void;
    setRecoveryVisibility: (mode: 'deleted' | 'all') => void;
}

const RecoveryContext = createContext<RecoveryContextType | undefined>(undefined);

export function RecoveryProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { isSuperAdmin, permissions } = useAuth();
    const [recoveryEnabled, setRecoveryEnabledState] = useState<boolean>(true);

    const isRouteSupported = useMemo(() => {
        return isPathInRecoveryWhiteList(pathname || '');
    }, [pathname]);

    const canUseRecovery = Boolean(
        recoveryEnabled &&
        isRouteSupported && (
            isSuperAdmin ||
            (permissions && (
                Boolean((permissions as any)['admin:recovery:read'])
            ))
        )
    );

    const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(false);
    const [recoveryVisibility, setRecoveryVisibilityState] = useState<'deleted' | 'all'>('deleted');

    const setRecoveryEnabled = useCallback((enabled: boolean) => {
        setRecoveryEnabledState(enabled);
        if (typeof window !== 'undefined') {
            if (!enabled) {
                localStorage.setItem('erp_recovery_enabled', 'false');
            } else {
                localStorage.removeItem('erp_recovery_enabled');
            }
        }
    }, []);

    const enableRecovery = useCallback(() => {
        setRecoveryEnabled(true);
    }, [setRecoveryEnabled]);

    const disableRecovery = useCallback(() => {
        setRecoveryEnabled(false);
    }, [setRecoveryEnabled]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const savedEnabled = localStorage.getItem('erp_recovery_enabled');
        if (savedEnabled === 'false') {
            setRecoveryEnabledState(false);
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const savedMode = localStorage.getItem('erp_recovery_mode');
        const initialOn = savedMode === '1' || savedMode === 'true';

        const savedVis = localStorage.getItem('erp_recovery_visibility');
        const initialVis = (savedVis === 'all' || savedVis === 'deleted') ? (savedVis as 'deleted' | 'all') : 'deleted';

        if (canUseRecovery) {
            setIsRecoveryMode(initialOn);
            setRecoveryVisibilityState(initialVis);
        } else {
            setIsRecoveryMode(false);
        }
    }, [canUseRecovery]);

    const toggleRecoveryMode = (on?: boolean) => {
        if (!canUseRecovery) return;

        const nextState = on !== undefined ? on : !isRecoveryMode;
        setIsRecoveryMode(nextState);

        if (nextState) {
            localStorage.setItem('erp_recovery_mode', '1');
            localStorage.setItem('erp_recovery_visibility', 'deleted');
            setRecoveryVisibilityState('deleted');
        } else {
            localStorage.removeItem('erp_recovery_mode');
        }

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('recovery-mode-changed', { detail: { on: nextState } }));
            window.dispatchEvent(new CustomEvent('recovery-visibility-changed', { detail: { mode: 'deleted' } }));
        }
    };

    const setRecoveryVisibility = (mode: 'deleted' | 'all') => {
        if (!canUseRecovery) return;

        setRecoveryVisibilityState(mode);
        localStorage.setItem('erp_recovery_visibility', mode);

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('recovery-visibility-changed', { detail: { mode } }));
        }
    };

    return (
        <RecoveryContext.Provider value={{
            isRecoveryMode: canUseRecovery && isRecoveryMode,
            recoveryVisibility,
            canUseRecovery,
            recoveryEnabled,
            isRouteSupported,
            setRecoveryEnabled,
            enableRecovery,
            disableRecovery,
            toggleRecoveryMode,
            setRecoveryVisibility,
        }}>
            {children}
        </RecoveryContext.Provider>
    );
}

export function useRecovery() {
    const context = useContext(RecoveryContext);
    if (context === undefined) {
        throw new Error('useRecovery must be used within a RecoveryProvider');
    }
    return context;
}
