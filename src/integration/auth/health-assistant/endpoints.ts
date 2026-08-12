/**
 * health assistant Authentication Endpoints
 * All endpoints are constants to prevent typos and ensure type safety
 * Note: /api prefix is handled by apiClient baseURL
 */

const HEALTH_ASSISTANT_AUTH_BASE = '/auth/assistant' as const;

export const HEALTH_ASSISTANT_ENDPOINTS = {
  REGISTER: `${HEALTH_ASSISTANT_AUTH_BASE}/register`,
  CREATE: `${HEALTH_ASSISTANT_AUTH_BASE}/create`,
  LOGIN: `${HEALTH_ASSISTANT_AUTH_BASE}/login`,
  VERIFY_2FA: `${HEALTH_ASSISTANT_AUTH_BASE}/verify-2fa`,
  FORGOT_PASSWORD: `${HEALTH_ASSISTANT_AUTH_BASE}/forgot-password`,
  VERIFY_OTP: `${HEALTH_ASSISTANT_AUTH_BASE}/verify-reset-otp`,
  RESET_PASSWORD: `${HEALTH_ASSISTANT_AUTH_BASE}/reset-password`,
  REFRESH_TOKEN: `${HEALTH_ASSISTANT_AUTH_BASE}/refresh`,
  LOGOUT: `${HEALTH_ASSISTANT_AUTH_BASE}/logout`,
  CHANGE_PASSWORD: `${HEALTH_ASSISTANT_AUTH_BASE}/change-password`,
  SETUP_2FA: `${HEALTH_ASSISTANT_AUTH_BASE}/setup-2fa`,
  ENABLE_2FA: `${HEALTH_ASSISTANT_AUTH_BASE}/enable-2fa`,
  DISABLE_2FA: `${HEALTH_ASSISTANT_AUTH_BASE}/disable-2fa`,
  REGENERATE_RECOVERY_CODES: `${HEALTH_ASSISTANT_AUTH_BASE}/regenerate-recovery-codes`,
  SESSION: `${HEALTH_ASSISTANT_AUTH_BASE}/session`,
  INVITE_PATIENT: `${HEALTH_ASSISTANT_AUTH_BASE}/invite-patient`,
  SEARCH_ASSIGNED_PATIENTS: `/patients/assigned`,
  FIRST_TIME_RESET_PASSWORD: `/auth/health-assistant/forgot-password`,
} as const;

export const HEALTH_ASSISTANT_API_ENDPOINTS = {
  SEARCH_ASSIGNED_PATIENTS: '/health-assistant/patient/search',
  RESET_PASSWORD: `/auth/health-assistant/reset-password`,
} as const;
/**
 * Type-safe endpoint getter
 */
export type HealthAssistantEndpoint =
  (typeof HEALTH_ASSISTANT_ENDPOINTS)[keyof typeof HEALTH_ASSISTANT_ENDPOINTS];

// Legacy alias for backward compatibility
export const DOCTOR_ENDPOINTS = HEALTH_ASSISTANT_ENDPOINTS;
export type DoctorEndpoint = HealthAssistantEndpoint;
