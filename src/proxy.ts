import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { doctorAccessToken } from '@/lib/constants';
import { ROUTES } from '@/lib/routes';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  const doctorToken = request.cookies.get(doctorAccessToken)?.value;
  const isLoggedIn = !!doctorToken;

  const authRoutes = [
    ROUTES.AUTH.ROOT,
    ROUTES.AUTH.LOGIN,
    ROUTES.AUTH.VERIFY_2FA,
    ROUTES.AUTH.VERIFY_OTP,
    ROUTES.AUTH.SETUP_2FA,
    ROUTES.AUTH.ENABLE_2FA,
    ROUTES.AUTH.FORGOT_PASSWORD,
    ROUTES.AUTH.RESET_PASSWORD,
    ROUTES.AUTH.PASSWORD_RESET_SUCCESS,
  ];

  const isAuthRoute = authRoutes.some((route) => pathname === route);

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/doctor') ||
    pathname.startsWith('/live-consultation');

  if (isAuthRoute && isLoggedIn) {
    const res = NextResponse.redirect(
      new URL(ROUTES.DASHBOARD.ROOT, request.url)
    );
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  if (isProtectedRoute && !isLoggedIn) {
    const res = NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
