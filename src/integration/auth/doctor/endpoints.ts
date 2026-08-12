/**
 * Doctor Authentication Endpoints
 * All endpoints are constants to prevent typos and ensure type safety
 * Note: /api prefix is handled by apiClient baseURL
 */

const DOCTOR_AUTH_BASE = '/auth/doctor' as const;

export const DOCTOR_ENDPOINTS = {
  REGISTER: `${DOCTOR_AUTH_BASE}/register`,
  LOGIN: `${DOCTOR_AUTH_BASE}/login`,
  VERIFY_2FA: `${DOCTOR_AUTH_BASE}/verify-2fa`,
  FORGOT_PASSWORD: `${DOCTOR_AUTH_BASE}/forgot-password`,
  VERIFY_OTP: `${DOCTOR_AUTH_BASE}/verify-reset-otp`,
  RESET_PASSWORD: `${DOCTOR_AUTH_BASE}/reset-password`,
  REFRESH_TOKEN: `${DOCTOR_AUTH_BASE}/refresh`,
  LOGOUT: `${DOCTOR_AUTH_BASE}/logout`,
  CHANGE_PASSWORD: `${DOCTOR_AUTH_BASE}/change-password`,
  SETUP_2FA: `${DOCTOR_AUTH_BASE}/setup-2fa`,
  ENABLE_2FA: `${DOCTOR_AUTH_BASE}/enable-2fa`,
  DISABLE_2FA: `${DOCTOR_AUTH_BASE}/disable-2fa`,
  REGENERATE_RECOVERY_CODES: `${DOCTOR_AUTH_BASE}/regenerate-recovery-codes`,
  SESSION: `${DOCTOR_AUTH_BASE}/session`,
  INVITE_PATIENT: `${DOCTOR_AUTH_BASE}/invite-patient`,
} as const;

/**
 * Type-safe endpoint getter
 */
export type DoctorEndpoint =
  (typeof DOCTOR_ENDPOINTS)[keyof typeof DOCTOR_ENDPOINTS];
