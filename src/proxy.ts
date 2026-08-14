import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  doctorAccessToken,
  healthAssistantAccessToken,
  patientAccessToken,
} from '@/lib/constants';
import { ROUTES } from '@/lib/routes';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/patient-invite') ||
    pathname.startsWith('/patient/register') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  const doctorToken = request.cookies.get(doctorAccessToken)?.value;
  const healthAssistantToken = request.cookies.get(
    healthAssistantAccessToken
  )?.value;
  const patientToken = request.cookies.get(patientAccessToken)?.value;

  const isDoctorLoggedIn = !!doctorToken;
  const isHealthAssistantLoggedIn = !!healthAssistantToken;
  const isPatientLoggedIn = !!patientToken;
  const isLoggedIn =
    isDoctorLoggedIn || isHealthAssistantLoggedIn || isPatientLoggedIn;

  const authRoutes = [
    ROUTES.AUTH.ROOT,
    ROUTES.AUTH.LOGIN,
    ROUTES.AUTH.VERIFY_2FA,
    ROUTES.AUTH.VERIFY_OTP,
    ROUTES.AUTH.SETUP_2FA,
    ROUTES.AUTH.ENABLE_2FA,
    ROUTES.AUTH.FORGOT_PASSWORD,
    ROUTES.AUTH.RESET_PASSWORD,
    ROUTES.AUTH.FIRST_TIME_RESET_PASSWORD,
    ROUTES.AUTH.PASSWORD_RESET_SUCCESS,
  ];

  const isAuthRoute = authRoutes.some((route) => pathname === route);
  const isDoctorRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/doctor') ||
    pathname.startsWith('/live-consultation') ||
    pathname.startsWith('/onboarding/doctor');
  const isHealthAssistantRoute =
    pathname.startsWith('/health-assistant') ||
    pathname.startsWith('/onboarding/health-assistant');
  const isPatientRoute = pathname.startsWith('/patient');

  // Logged-in users on auth pages → role home
  if (isAuthRoute && isLoggedIn) {
    if (isDoctorLoggedIn) {
      const res = NextResponse.redirect(
        new URL(ROUTES.DASHBOARD.ROOT, request.url)
      );
      res.headers.set('Cache-Control', 'no-store');
      return res;
    }
    if (isHealthAssistantLoggedIn) {
      const res = NextResponse.redirect(
        new URL(ROUTES.HEALTH_ASSISTANT.PATIENT.ROOT, request.url)
      );
      res.headers.set('Cache-Control', 'no-store');
      return res;
    }
    if (isPatientLoggedIn) {
      const res = NextResponse.redirect(
        new URL(ROUTES.PATIENT.ROOT, request.url)
      );
      res.headers.set('Cache-Control', 'no-store');
      return res;
    }
  }

  // Prefer the cookie that matches this portal so leftover sessions from
  // another role cannot kick a logged-in doctor/HA/patient off their own pages.
  if (isDoctorRoute) {
    if (isDoctorLoggedIn) {
      return NextResponse.next();
    }
    if (isHealthAssistantLoggedIn) {
      const res = NextResponse.redirect(
        new URL(ROUTES.HEALTH_ASSISTANT.PATIENT.ROOT, request.url)
      );
      res.headers.set('Cache-Control', 'no-store');
      return res;
    }
    if (isPatientLoggedIn) {
      const res = NextResponse.redirect(
        new URL(ROUTES.PATIENT.ROOT, request.url)
      );
      res.headers.set('Cache-Control', 'no-store');
      return res;
    }
    const res = NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  if (isHealthAssistantRoute) {
    if (isHealthAssistantLoggedIn) {
      return NextResponse.next();
    }
    if (isDoctorLoggedIn) {
      const res = NextResponse.redirect(
        new URL(ROUTES.DASHBOARD.ROOT, request.url)
      );
      res.headers.set('Cache-Control', 'no-store');
      return res;
    }
    if (isPatientLoggedIn) {
      const res = NextResponse.redirect(
        new URL(ROUTES.PATIENT.ROOT, request.url)
      );
      res.headers.set('Cache-Control', 'no-store');
      return res;
    }
    const res = NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  if (isPatientRoute) {
    if (isPatientLoggedIn) {
      return NextResponse.next();
    }
    if (isDoctorLoggedIn) {
      const res = NextResponse.redirect(
        new URL(ROUTES.DASHBOARD.ROOT, request.url)
      );
      res.headers.set('Cache-Control', 'no-store');
      return res;
    }
    if (isHealthAssistantLoggedIn) {
      const res = NextResponse.redirect(
        new URL(ROUTES.HEALTH_ASSISTANT.PATIENT.ROOT, request.url)
      );
      res.headers.set('Cache-Control', 'no-store');
      return res;
    }
    const res = NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
