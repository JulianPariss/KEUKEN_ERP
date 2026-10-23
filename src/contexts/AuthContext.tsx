'use client';

import { loginAction, logoutAction, updatePermissionsCookieAction } from '@/app/actions/auth.actions';
import { TFPermissionsConfig } from '@/app/lib/permissions/getPermissions';
import { mapPermissionsToFrontend } from '@/app/lib/utils/permission.helper';
import { authService } from '@repo/erp-services/userContext/auth.service';
import { ICompany } from "@repo/api-contracts/erp";
import { IFProfileContext } from "@repo/api-contracts/erp";
import { IFUser } from "@repo/api-contracts/erp";
import { companiesService } from '@repo/erp-services/userContext/companies.service';
import { getToken } from '@/lib/utils/token.helper';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';


interface AuthContextType {
    isAuthenticated: boolean;
    user: IFUser | null;
    profileContext: IFProfileContext | null;
    token: string;
    permissions: TFPermissionsConfig | undefined;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    companies: ICompany[];
    currentCompany: ICompany | null;
    changeCompany: (company: ICompany) => Promise<void>;
    refreshProfileContext: (companyId?: string, branchId?: string) => Promise<IFProfileContext | null>;
    includeInactive: boolean;
    isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any | null>(null);
    const [profileContext, setProfileContext] = useState<IFProfileContext | null>(null);
    const [loading, setLoading] = useState(true);
    const [companies, setCompanies] = useState<ICompany[]>([]);
    const [currentCompany, setCurrentCompany] = useState<ICompany | null>(null);
    const [permissions, setPermissions] = useState<TFPermissionsConfig>();

    const [token, setToken] = useState<string>('');

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const storedToken = getToken();
        const userData = localStorage.getItem('userData');
        const savedProfileContext = localStorage.getItem('profileContext');
        const savedCompanies = localStorage.getItem('companies');
        const savedCurrentCompany = localStorage.getItem('currentCompany');

        if (storedToken && userData) {
            setIsAuthenticated(true);
            setToken(storedToken);
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);

            let effectivePermissions = parsedUser.roles || [];

            if (savedProfileContext) {
                try {
                    const parsedProfileContext: IFProfileContext = JSON.parse(savedProfileContext);
                    setProfileContext(parsedProfileContext);
                    effectivePermissions = Array.from(new Set([
                        ...(parsedProfileContext.rolesEffective || []),
                        ...(parsedUser.roles || []),
                        ...(parsedProfileContext.scopesEffective || []),
                    ]));
                } catch (e) {
                    console.error('Error parsing stored profileContext:', e);
                }
            }

            setPermissions(mapPermissionsToFrontend(effectivePermissions));

            if (savedCompanies) {
                const parsedCompanies = JSON.parse(savedCompanies);
                setCompanies(parsedCompanies);

                if (savedCurrentCompany) {
                    setCurrentCompany(JSON.parse(savedCurrentCompany));
                } else if (parsedCompanies.length > 0) {
                    setCurrentCompany(parsedCompanies[0]);
                }
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!loading && !isAuthenticated && !pathname.startsWith('/login')) {
            router.push('/login');
        }
    }, [isAuthenticated, loading, pathname, router]);

    const login = async (email: string, password: string) => {
        try {
            const result = await loginAction(email, password);

            if (!result.success || !result.user || !result.token) {
                throw new Error(result.error || 'Error al iniciar sesión');
            }

            const { user, token, profileContext: initialProfileContext } = result;

            localStorage.setItem('authToken', token);
            localStorage.setItem('userData', JSON.stringify(user));

            const companiesRes = await companiesService.getAll({ limit: 50000, offset: 0 }, token);

            const userCompanies = companiesRes.items.filter(c =>
                user.companyIds.includes(c.id)
            );

            setCompanies(userCompanies);
            localStorage.setItem('companies', JSON.stringify(userCompanies));

            let selectedCompany: ICompany | null = null;
            if (userCompanies.length > 0) {
                selectedCompany = userCompanies[0];
                setCurrentCompany(selectedCompany);
                localStorage.setItem('currentCompany', JSON.stringify(selectedCompany));
            }

            let fetchedProfileContext: IFProfileContext | null = initialProfileContext || null;

            if (selectedCompany?.id) {
                try {
                    fetchedProfileContext = await authService.getProfileContext(token, selectedCompany.id);
                } catch (err) {
                    console.error('Error fetching profile context for operational company:', err);
                }
            }

            if (fetchedProfileContext) {
                setProfileContext(fetchedProfileContext);
                localStorage.setItem('profileContext', JSON.stringify(fetchedProfileContext));
                
                const effectivePermissions = Array.from(new Set([
                    ...(fetchedProfileContext.rolesEffective || []),
                    ...(user?.roles || []),
                    ...(fetchedProfileContext.scopesEffective || []),
                ]));
                setPermissions(mapPermissionsToFrontend(effectivePermissions));
            } else {
                const permissionsArray = user?.roles || [];
                setPermissions(mapPermissionsToFrontend(permissionsArray));
            }

            setIsAuthenticated(true);
            setToken(token);
            setUser(user);
            router.push('/');
        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        // Ejecutamos la acción de servidor para borrar cookies
        await logoutAction();

        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('profileContext');
        localStorage.removeItem('companies');
        localStorage.removeItem('currentCompany');

        setIsAuthenticated(false);
        setToken('');
        setUser(null);
        setProfileContext(null);
        setCompanies([]);
        setCurrentCompany(null);
        router.push('/login');
    };

    const refreshProfileContext = async (companyId?: string, branchId?: string): Promise<IFProfileContext | null> => {
        const targetCompanyId = companyId || currentCompany?.id;
        if (token && targetCompanyId) {
            try {
                const newProfileContext = await authService.getProfileContext(token, targetCompanyId, branchId);
                setProfileContext(newProfileContext);
                localStorage.setItem('profileContext', JSON.stringify(newProfileContext));

                const effectivePermissions = Array.from(new Set([
                    ...(newProfileContext.rolesEffective || []),
                    ...(user?.roles || []),
                    ...(newProfileContext.scopesEffective || []),
                ]));
                setPermissions(mapPermissionsToFrontend(effectivePermissions));

                // Sincronizar cookie del servidor para que el proxy valide la compañía actual
                updatePermissionsCookieAction(effectivePermissions).catch((err) => {
                    console.error('Error updating permissions cookie on refresh:', err);
                });

                if (user) {
                    const updatedUser = { ...user, roles: effectivePermissions };
                    setUser(updatedUser);
                    localStorage.setItem('userData', JSON.stringify(updatedUser));
                }

                return newProfileContext;
            } catch (err) {
                console.error('Error updating profile context:', err);
            }
        }
        return null;
    };

    const changeCompany = async (company: ICompany) => {
        setCurrentCompany(company);
        localStorage.setItem('currentCompany', JSON.stringify(company));
        await refreshProfileContext(company.id);
    };

    const includeInactive = true;
    const isSuperAdmin = user?.roles?.includes('superadmin') || profileContext?.rolesEffective?.includes('superadmin') || false;

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            profileContext,
            token,
            login,
            logout,
            loading,
            companies,
            currentCompany,
            changeCompany,
            refreshProfileContext,
            permissions,
            includeInactive,
            isSuperAdmin,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}