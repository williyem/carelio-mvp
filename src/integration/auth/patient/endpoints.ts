/**
 * Patient Authentication Endpoints
 * All endpoints are constants to prevent typos and ensure type safety
 * Note: /api prefix is handled by apiClient baseURL
 */

const PATIENT_AUTH_BASE = '/auth/patient' as const;

export const PATIENT_ENDPOINTS = {
  LOGIN: `${PATIENT_AUTH_BASE}/login`,
  VERIFY_LOGIN_EMAIL: `${PATIENT_AUTH_BASE}/verify-login-email`,
  FORGOT_PASSWORD: `${PATIENT_AUTH_BASE}/forgot-password`,
  RESET_PASSWORD: `${PATIENT_AUTH_BASE}/reset-password`,
  REFRESH_TOKEN: `${PATIENT_AUTH_BASE}/refresh`,
  LOGOUT: `${PATIENT_AUTH_BASE}/logout`,
  SESSION: `${PATIENT_AUTH_BASE}/session`,
  VERIFY_INVITATION: `${PATIENT_AUTH_BASE}/verify-invitation`,
  COMPLETE_REGISTRATION: `${PATIENT_AUTH_BASE}/complete-registration`,
  VERIFY_CONSENT: `${PATIENT_AUTH_BASE}/verify-consent`,
  VERIFY_INVITE: `${PATIENT_AUTH_BASE}/verify-invitation`,
} as const;

/**
 * Type-safe endpoint getter
 */
export type PatientEndpoint =
  (typeof PATIENT_ENDPOINTS)[keyof typeof PATIENT_ENDPOINTS];
