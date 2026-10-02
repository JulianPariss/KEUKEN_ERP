import { MOCK_COMPANY_MODULES, TModuleKey } from "../permissions/getModules";
import {
    IPagePermission,
    MASTER_PERMISSIONS,
    PERMISSION_ACTIONS,
    permissionsConfig,
    ROUTE_VIEW_MAP,
    TBackendPermissionKey,
    TFPermissionsConfig,
    TPermissionAction,
    TViewPermissionKey,
    VIEW_TO_MODULE_MAP,
    viewPermissionsRequireds,
    TMaxAuthority,
    AUTHORITY_HIERARCHY,
    IActionPermissionConfig,
} from "../permissions/getPermissions";


export const checkAuthorityAccess = (
    userPermissions: string[],
    maxAuthority?: TMaxAuthority,
    onlyMaxAuthority?: boolean
): { allowed: boolean; bypassPermissions: boolean } | null => {
    if (!maxAuthority) {
        return null;
    }

    const userLevel = userPermissions.includes('superadmin') ? 2 : userPermissions.includes('admin') ? 1 : 0;
    const requiredLevel = AUTHORITY_HIERARCHY[maxAuthority] || 0;

    if (onlyMaxAuthority) {
        const allowed = userLevel >= requiredLevel;
        return { allowed, bypassPermissions: allowed };
    } else {
        if (userLevel >= requiredLevel) {
            return { allowed: true, bypassPermissions: true };
        }
        return null;
    }
};

export const canRenderRoute = (pathname: string, userPermissions: string[], companyId: string = 'company-1'): boolean => {
    const matchingRoutePrefix = Object.keys(ROUTE_VIEW_MAP).find(route =>
        pathname.startsWith(route)
    );

    if (matchingRoutePrefix) {
        const viewKey = ROUTE_VIEW_MAP[matchingRoutePrefix];

        const moduleKey = VIEW_TO_MODULE_MAP[viewKey];
        if (moduleKey && !isModuleEnabledForCompany(companyId, moduleKey)) {
            return false;
        }

        const viewConfig = viewPermissionsRequireds[viewKey];

        // Extract view config details
        let requiredModules: TBackendPermissionKey[] = [];
        let maxAuthority: TMaxAuthority | undefined;
        let onlyMaxAuthority: boolean | undefined;

        if (Array.isArray(viewConfig)) {
            requiredModules = viewConfig;
        } else if (viewConfig && typeof viewConfig === 'object') {
            requiredModules = viewConfig.requiredPermissions || [];
            maxAuthority = viewConfig.maxAuthority;
            onlyMaxAuthority = viewConfig.onlyMaxAuthority;
        }

        const userLevel = userPermissions.includes('superadmin') ? 2 : userPermissions.includes('admin') ? 1 : 0;
        const viewRequiredLevel = maxAuthority ? AUTHORITY_HIERARCHY[maxAuthority] : 0;
        const canGeneralBypass = !maxAuthority || userLevel >= viewRequiredLevel;

        // View-level authority check
        const authCheck = checkAuthorityAccess(userPermissions, maxAuthority, onlyMaxAuthority);
        if (authCheck !== null) {
            if (!authCheck.allowed) {
                return false;
            }
            if (authCheck.bypassPermissions) {
                return true;
            }
        } else {
            // General admin/superadmin bypass if allowed and no specific view restriction
            if (canGeneralBypass && userLevel > 0) {
                return true;
            }
        }

        return requiredModules.every(moduleKey => {
            const actionConfig = MASTER_PERMISSIONS[moduleKey].backendMap.view;
            let requiredViewPermissions: string[] = [];
            let actMaxAuthority: TMaxAuthority | undefined;
            let actOnlyMaxAuthority: boolean | undefined;

            if (Array.isArray(actionConfig)) {
                requiredViewPermissions = actionConfig as unknown as string[];
            } else if (actionConfig && typeof actionConfig === 'object') {
                requiredViewPermissions = (actionConfig as unknown as IActionPermissionConfig).keys || [];
                actMaxAuthority = (actionConfig as unknown as IActionPermissionConfig).maxAuthority;
                actOnlyMaxAuthority = (actionConfig as unknown as IActionPermissionConfig).onlyMaxAuthority;
            }

            // Action-level authority check
            const actAuthCheck = checkAuthorityAccess(userPermissions, actMaxAuthority, actOnlyMaxAuthority);
            if (actAuthCheck !== null) {
                if (!actAuthCheck.allowed) {
                    return false;
                }
                if (actAuthCheck.bypassPermissions) {
                    return true;
                }
            } else {
                // General action-level bypass if allowed
                if (canGeneralBypass && !actMaxAuthority && userLevel > 0) {
                    return true;
                }
            }

            return requiredViewPermissions.every(req => checkPerCategory(req, userPermissions));
        });
    }

    return true;
}

export const mapPermissionsToBackend = (permissions: TFPermissionsConfig): string[] => {
    const mappedPermissions = new Set<string>();

    (Object.values(permissions) as IPagePermission[]).forEach((permission) => {
        if (!permission) return;

        const key = permission.backendKey;
        const actions = permission.actions;

        const backendActions = MASTER_PERMISSIONS[key].backendMap;

        PERMISSION_ACTIONS.forEach(action => {
            if (actions[action]) {
                const actionConfig = backendActions[action];
                let keys: string[] = [];
                if (Array.isArray(actionConfig)) {
                    keys = actionConfig as unknown as string[];
                } else if (actionConfig && typeof actionConfig === 'object') {
                    keys = (actionConfig as unknown as IActionPermissionConfig).keys || [];
                }
                keys.forEach((p: string) => mappedPermissions.add(p));
            }
        });
    });

    return Array.from(mappedPermissions);
}

export const checkPerCategory = (permissionRequired: string, permissions: string[]) => {
    return permissions.some(hasPermission => {
        if (hasPermission === permissionRequired || hasPermission === '*' || hasPermission === 'all') return true;

        const hasParts = hasPermission.split(':');
        const reqParts = permissionRequired.split(':');

        for (let i = 0; i < reqParts.length; i++) {
            if (hasParts[i] === '*') {
                if (i === hasParts.length - 1) return true;
                continue;
            }
            if (hasParts[i] !== reqParts[i]) return false;
        }

        return hasParts.length === reqParts.length;
    });
}

export const mapPermissionsToFrontend = (permissions: string[]): TFPermissionsConfig => {
    const result = {} as TFPermissionsConfig;

    (Object.entries(MASTER_PERMISSIONS) as [TBackendPermissionKey, typeof MASTER_PERMISSIONS[TBackendPermissionKey]][]).forEach(([backendKey, config]) => {

        const actions: Record<TPermissionAction, boolean | null> = {
            view: false,
            modify: false,
            extract: false,
        };

        PERMISSION_ACTIONS.forEach(action => {
            const actionConfig = config.backendMap[action];
            let required: string[] = [];
            let maxAuthority: TMaxAuthority | undefined;
            let onlyMaxAuthority: boolean | undefined;

            if (Array.isArray(actionConfig)) {
                required = actionConfig as unknown as string[];
            } else if (actionConfig && typeof actionConfig === 'object') {
                required = (actionConfig as any).keys || [];
                maxAuthority = (actionConfig as any).maxAuthority;
                onlyMaxAuthority = (actionConfig as any).onlyMaxAuthority;
            }

            if (required.length === 0 && !maxAuthority) {
                actions[action] = null;
                return;
            }

            // Action-level authority check
            const authCheck = checkAuthorityAccess(permissions, maxAuthority, onlyMaxAuthority);
            if (authCheck !== null) {
                actions[action] = authCheck.allowed;
            } else {
                // If action has a maxAuthority, the user level is too low to bypass.
                // Otherwise, general bypass applies to Admin/Superadmin.
                if (maxAuthority) {
                    if (required.every(permission => checkPerCategory(permission, permissions))) {
                        actions[action] = true;
                    } else {
                        actions[action] = false;
                    }
                } else {
                    const userLevel = permissions.includes('superadmin') ? 2 : permissions.includes('admin') ? 1 : 0;
                    if (userLevel > 0) {
                        actions[action] = true;
                    } else if (required.every(permission => checkPerCategory(permission, permissions))) {
                        actions[action] = true;
                    } else {
                        actions[action] = false;
                    }
                }
            }
        });

        result[backendKey] = {
            ...permissionsConfig[backendKey],
            actions
        };
    });

    // Safely attach the raw permissions so that helpers can read it without listing it in Object.keys
    Object.defineProperty(result, '__rawPermissions', {
        value: permissions,
        enumerable: false,
        writable: true,
        configurable: true
    });

    return result;
};

export const canDo = (action: TPermissionAction, key: TBackendPermissionKey[], permissions: TFPermissionsConfig): boolean => {
    if (!permissions || !key || key.length === 0) return false;

    // Retrieve raw permissions if attached
    const userRawPermissions = (permissions as any).__rawPermissions || [];

    return key.every(k => {
        const permission = permissions[k];
        if (!permission) return false;

        // Double check authority overrides at runtime in canDo if user has authority
        const actionConfig = MASTER_PERMISSIONS[k].backendMap[action];
        let maxAuthority: TMaxAuthority | undefined;
        let onlyMaxAuthority: boolean | undefined;

        if (actionConfig && !Array.isArray(actionConfig) && typeof actionConfig === 'object') {
            maxAuthority = (actionConfig as unknown as IActionPermissionConfig).maxAuthority;
            onlyMaxAuthority = (actionConfig as unknown as IActionPermissionConfig).onlyMaxAuthority;
        }

        const authCheck = checkAuthorityAccess(userRawPermissions, maxAuthority, onlyMaxAuthority);
        if (authCheck !== null) {
            return authCheck.allowed;
        } else {
            // General admin/superadmin bypass if no specific maxAuthority restricts it
            if (!maxAuthority) {
                const userLevel = userRawPermissions.includes('superadmin') ? 2 : userRawPermissions.includes('admin') ? 1 : 0;
                if (userLevel > 0) {
                    return true;
                }
            }
        }

        return permission.actions[action] ?? false;
    });
}

export const canView = (key: TViewPermissionKey, permissions: TFPermissionsConfig): boolean => {
    const viewConfig = viewPermissionsRequireds[key];
    const userRawPermissions = (permissions as any).__rawPermissions || [];

    // Extract view config details
    let requiredModules: TBackendPermissionKey[] = [];
    let maxAuthority: TMaxAuthority | undefined;
    let onlyMaxAuthority: boolean | undefined;

    if (Array.isArray(viewConfig)) {
        requiredModules = viewConfig;
    } else if (viewConfig && typeof viewConfig === 'object') {
        requiredModules = viewConfig.requiredPermissions || [];
        maxAuthority = viewConfig.maxAuthority;
        onlyMaxAuthority = viewConfig.onlyMaxAuthority;
    }

    const userLevel = userRawPermissions.includes('superadmin') ? 2 : userRawPermissions.includes('admin') ? 1 : 0;
    const viewRequiredLevel = maxAuthority ? AUTHORITY_HIERARCHY[maxAuthority] : 0;
    const canGeneralBypass = !maxAuthority || userLevel >= viewRequiredLevel;

    // View-level authority check
    const authCheck = checkAuthorityAccess(userRawPermissions, maxAuthority, onlyMaxAuthority);
    if (authCheck !== null) {
        if (!authCheck.allowed) {
            return false;
        }
        if (authCheck.bypassPermissions) {
            return true;

        }
    } else {
        // General admin/superadmin bypass if allowed and no specific view restriction
        if (canGeneralBypass && userLevel > 0) {
            return true;
        }
    }

    return requiredModules.every((moduleKey) => {
        const actionConfig = MASTER_PERMISSIONS[moduleKey].backendMap.view;
        let requiredViewPermissions: string[] = [];
        let actMaxAuthority: TMaxAuthority | undefined;
        let actOnlyMaxAuthority: boolean | undefined;

        if (Array.isArray(actionConfig)) {
            requiredViewPermissions = actionConfig as unknown as string[];
        } else if (actionConfig && typeof actionConfig === 'object') {
            requiredViewPermissions = (actionConfig as unknown as IActionPermissionConfig).keys || [];
            actMaxAuthority = (actionConfig as unknown as IActionPermissionConfig).maxAuthority;
            actOnlyMaxAuthority = (actionConfig as unknown as IActionPermissionConfig).onlyMaxAuthority;
        }

        // Action-level authority check
        const actAuthCheck = checkAuthorityAccess(userRawPermissions, actMaxAuthority, actOnlyMaxAuthority);
        if (actAuthCheck !== null) {
            if (!actAuthCheck.allowed) {
                return false;
            }
            if (actAuthCheck.bypassPermissions) {
                return true;
            }
        } else {
            // General action-level bypass if allowed
            if (canGeneralBypass && !actMaxAuthority && userLevel > 0) {
                return true;
            }
        }

        return requiredViewPermissions.every(req => checkPerCategory(req, userRawPermissions));
    });
}

export const isModuleEnabledForCompany = (companyId: string, moduleKey: TModuleKey): boolean => {
    const companyModules = MOCK_COMPANY_MODULES[companyId];

    if (!companyModules) {
        return false;
    }

    return companyModules[moduleKey] ?? false;
};