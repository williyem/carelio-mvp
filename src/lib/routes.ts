/**
 * Application route constants
 * Centralized location for all route paths
 */

export const ROUTES = {
  // Auth routes
  AUTH: {
    ROOT: '/',
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY_OTP: '/verify-otp',
    VERIFY_2FA: '/verify-2fa',
    RESET_PASSWORD: '/reset-password',
    FIRST_TIME_RESET_PASSWORD: '/first-time-reset-password',
    PASSWORD_RESET_SUCCESS: '/password-reset-success',
    SETUP_2FA: '/setup-2fa',
    ENABLE_2FA: '/enable-2fa',
  },

  // Dashboard routes
  DASHBOARD: {
    ROOT: '/dashboard',

    // Patient routes
    PATIENT: {
      ROOT: '/dashboard/patient',
      DETAILS: (id: string) => `/dashboard/patient/${id}`,
    },
  },
} as const;

export const API_ENDPOINTS = {
  register: '/api/auth/patient/register',
  login: '/api/auth/patient/login',
  doctorLogin: '/api/auth/doctor/login',
  setup2FA: '/api/auth/doctor/setup-2fa',
  enable2FA: '/api/auth/doctor/enable-2fa',
  verify2FA: '/api/auth/doctor/verify-2fa',
  clearCookies: '/api/auth/clear-cookies',
} as const;
