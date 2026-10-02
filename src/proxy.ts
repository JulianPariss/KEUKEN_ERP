import { canRenderRoute } from '@/app/lib/utils/permission.helper';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const publicPaths = ['/login'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('authToken')?.value;

    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isPublicPath) {
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


    const canRenderGlobalView = canRenderRoute(pathname, userPermissions);

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
