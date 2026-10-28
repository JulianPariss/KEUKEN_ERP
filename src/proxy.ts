import { canRenderRoute } from '@repo/access';
import { TFMeLicenseField } from '@repo/api-contracts/erp';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const publicPaths = ['/login', '/refused'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('authToken')?.value;

    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    const cookieVal = request.cookies.get('permissions')?.value;
    let userPermissions: string[] = [];

    try {
        userPermissions = cookieVal ? JSON.parse(decodeURIComponent(cookieVal)) : [];
        if (!Array.isArray(userPermissions)) userPermissions = [];
    } catch (e) {
        console.error('Error parsing permissions cookie in proxy:', e);
        userPermissions = [];
    }

    const licenseCookieVal = request.cookies.get('companyLicense')?.value;
    let companyLicense: TFMeLicenseField = null;

    try {
        companyLicense = licenseCookieVal ? JSON.parse(decodeURIComponent(licenseCookieVal)) : null;
    } catch (e) {
        console.error('Error parsing companyLicense cookie in proxy:', e);
        companyLicense = null;
    }

    const canRenderGlobalView = canRenderRoute(pathname, userPermissions, companyLicense);

    if (!canRenderGlobalView) {
        return NextResponse.redirect(new URL('/refused', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|json|woff|woff2|ttf|eot)).*)',
    ]
};
