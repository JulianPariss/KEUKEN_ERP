'use server';

import { authService } from '@/app/services/userContext/auth.service';
import { cookies, headers } from 'next/headers';

export async function loginAction(email: string, password: string) {
    try {
        const authData = await authService.login(email, password);
        
        // Obtener la primera compañía por defecto si existe
        const defaultCompanyId = authData.user?.companyIds?.[0];
        
        // Obtener el contexto de perfil del usuario utilizando el token devuelto y la compañía por defecto
        const profileData = await authService.getProfileContext(authData.accessToken, defaultCompanyId);
        
        const cookieStore = await cookies();
        const headersList = await headers();

        // Determinar si la conexión es HTTPS de manera highly resiliente.
        // Inspeccionamos el referer para saber con certeza qué protocolo está viendo el cliente real.
        const xForwardedProto = headersList.get('x-forwarded-proto');
        const referer = headersList.get('referer') || '';
        
        const clientIsHttps = referer.startsWith('https://');
        const clientIsHttp = referer.startsWith('http://');
        const proxyIsHttps = xForwardedProto === 'https';

        // Si el referer indica explícitamente HTTP, forzamos isSecure a false 
        // para evitar que proxies inversos mal configurados (que fuercen X-Forwarded-Proto: https)
        // hagan que el navegador descarte la cookie en un entorno unencrypted (HTTP).
        let isSecure = false;
        if (process.env.NODE_ENV === 'production') {
            if (clientIsHttp) {
                isSecure = false;
            } else if (clientIsHttps) {
                isSecure = true;
            } else {
                // Fallback si no hay referer
                isSecure = proxyIsHttps;
            }
        }


        cookieStore.set('authToken', authData.accessToken, {
            httpOnly: true,
            secure: isSecure,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        const permissionsArray = profileData.scopesEffective?.length ? profileData.scopesEffective : (profileData.rolesEffective || []);
        cookieStore.set('permissions', encodeURIComponent(JSON.stringify(permissionsArray)), {
            httpOnly: false,
            secure: isSecure,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

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

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete('authToken');
    cookieStore.delete('permissions');
}
