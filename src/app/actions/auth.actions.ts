'use server';

import { authService } from '@repo/erp-services/userContext/auth.service';
import { TFMeLicenseField } from '@repo/api-contracts/erp';
import { cookies, headers } from 'next/headers';

async function getIsSecure(): Promise<boolean> {
    const headersList = await headers();
    const xForwardedProto = headersList.get('x-forwarded-proto');
    const referer = headersList.get('referer') || '';

    const clientIsHttps = referer.startsWith('https://');
    const clientIsHttp = referer.startsWith('http://');
    const proxyIsHttps = xForwardedProto === 'https';

    let isSecure = false;
    if (process.env.NODE_ENV === 'production') {
        if (clientIsHttp) {
            isSecure = false;
        } else if (clientIsHttps) {
            isSecure = true;
        } else {
            isSecure = proxyIsHttps;
        }
    }
    return isSecure;
}

export async function loginAction(email: string, password: string) {
    try {
        const authData = await authService.login(email, password);

        // Obtener la primera compañía por defecto si existe
        const defaultCompanyId = authData.user?.companyIds?.[0];

        // Obtener el contexto de perfil del usuario utilizando el token devuelto y la compañía por defecto
        const profileData = await authService.getProfileContext(authData.accessToken, defaultCompanyId);

        const cookieStore = await cookies();
        const isSecure = await getIsSecure();

        cookieStore.set('authToken', authData.accessToken, {
            httpOnly: true,
            secure: isSecure,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        // Combinar roles y scopes de la empresa operativa (roles_effective + scopes_effective)
        const permissionsArray = Array.from(new Set([
            ...(profileData.rolesEffective || []),
            ...(profileData.scopesEffective || []),
        ]));

        cookieStore.set('permissions', encodeURIComponent(JSON.stringify(permissionsArray)), {
            httpOnly: false,
            secure: isSecure,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        // Guardar licencia de la compañía operativa en cookie para SSR y middleware
        if (profileData.license) {
            cookieStore.set('companyLicense', encodeURIComponent(JSON.stringify(profileData.license)), {
                httpOnly: false,
                secure: isSecure,
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
            });
        }

        const userWithRoles = {
            ...authData.user,
            login: profileData.login,
            active: true,
            roles: permissionsArray,
        };

        return { success: true, user: userWithRoles, token: authData.accessToken, profileContext: profileData };
    } catch (error: any) {
        return { success: false, error: error.message || 'Error al iniciar sesión' };
    }
}

export async function updatePermissionsCookieAction(permissions: string[]) {
    try {
        const cookieStore = await cookies();
        const isSecure = await getIsSecure();
        cookieStore.set('permissions', encodeURIComponent(JSON.stringify(permissions)), {
            httpOnly: false,
            secure: isSecure,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });
        return { success: true };
    } catch (error: any) {
        console.error('Error updating permissions cookie:', error);
        return { success: false, error: error.message };
    }
}

export async function updateCompanyLicenseCookieAction(license: TFMeLicenseField | undefined) {
    try {
        const cookieStore = await cookies();
        const isSecure = await getIsSecure();
        if (license) {
            cookieStore.set('companyLicense', encodeURIComponent(JSON.stringify(license)), {
                httpOnly: false,
                secure: isSecure,
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
            });
        } else {
            cookieStore.delete('companyLicense');
        }
        return { success: true };
    } catch (error: any) {
        console.error('Error updating companyLicense cookie:', error);
        return { success: false, error: error.message };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete('authToken');
    cookieStore.delete('permissions');
    cookieStore.delete('companyLicense');
}
