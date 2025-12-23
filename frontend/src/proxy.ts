import { NextResponse, NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/signup');

    if (!token && !isAuthPage) {
        // Redirect to login if trying to access protected route without token
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isAuthPage) {
        // Redirect to home if already logged in and trying to access login/signup
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// Config determines which routes are handled by this middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
