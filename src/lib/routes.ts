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

  // Doctor dashboard routes
  DASHBOARD: {
    ROOT: '/dashboard',
    SETTINGS: {
      ROOT: '/dashboard/settings',
      SCHEDULE: '/dashboard/settings/schedule',
      SECURITY: '/dashboard/settings/security',
      BILLING: '/dashboard/settings/billing-payout',
    },
    PATIENT: {
      ROOT: '/dashboard/patient',
      DETAILS: (id: string) => `/dashboard/patient/${id}`,
    },
  },

  ONBOARDING: {
    DOCTOR: '/onboarding/doctor',
    HEALTH_ASSISTANT: '/onboarding/health-assistant',
  },

  // Health Assistant routes
  HEALTH_ASSISTANT: {
    PATIENT: {
      ROOT: '/health-assistant/patient',
      DETAILS: (id: string) => `/health-assistant/patient/${id}`,
      SUMMARY: (id: string, appointmentId: string) =>
        `/health-assistant/patient/${id}/${appointmentId}`,
      ADD_NEW: '/health-assistant/patient/add-new-patient',
    },
    APPOINTMENTS: {
      ROOT: '/health-assistant/appointments',
    },
    ASSIGNMENTS: {
      ROOT: '/health-assistant/assignments',
    },
    SETTINGS: {
      ROOT: '/health-assistant/settings',
      SECURITY: '/health-assistant/settings/security',
    },
  },

  // Patient portal routes
  PATIENT: {
    ROOT: '/patient',
    ONBOARDING: '/patient/onboarding',
    RECORD_VITALS: '/patient/record-vitals',
    VITAL_HISTORY: '/patient/vital-history',
    HEALTH_RECORDS: '/patient/health-records',
    RECORD_DETAILS: (recordId: string) => `/patient/health-records/${recordId}`,
    REGISTER: '/patient/register',
    INVITE: '/patient-invite',
    SETTINGS: {
      ROOT: '/patient/settings',
      BILLING: '/patient/settings/billing',
      ACCESS: '/patient/settings/access',
    },
  },
} as const;

// Next.js API route constants (client-side routes)
const NEXT_API_BASE = '/api/auth' as const;
const NEXT_API_HEALTH_ASSISTANT_BASE =
  `${NEXT_API_BASE}/health-assistant` as const;
const NEXT_API_PATIENT_BASE = `${NEXT_API_BASE}/patient` as const;
const NEXT_API_DOCTOR_BASE = `${NEXT_API_BASE}/doctor` as const;

export const NEXT_API_ROUTES = {
  DOCTOR: {
    LOGIN: `${NEXT_API_DOCTOR_BASE}/login`,
    REGISTER: `${NEXT_API_DOCTOR_BASE}/register`,
    SETUP_2FA: `${NEXT_API_DOCTOR_BASE}/setup-2fa`,
    ENABLE_2FA: `${NEXT_API_DOCTOR_BASE}/enable-2fa`,
    VERIFY_2FA: `${NEXT_API_DOCTOR_BASE}/verify-2fa`,
    FORGOT_PASSWORD: `${NEXT_API_DOCTOR_BASE}/forgot-password`,
    VERIFY_OTP: `${NEXT_API_DOCTOR_BASE}/verify-reset-otp`,
    RESET_PASSWORD: `${NEXT_API_DOCTOR_BASE}/reset-password`,
    REFRESH: `${NEXT_API_DOCTOR_BASE}/refresh`,
    LOGOUT: `${NEXT_API_DOCTOR_BASE}/logout`,
    SESSION: `${NEXT_API_DOCTOR_BASE}/session`,
    CHANGE_PASSWORD: `${NEXT_API_DOCTOR_BASE}/change-password`,
    DISABLE_2FA: `${NEXT_API_DOCTOR_BASE}/disable-2fa`,
    REGENERATE_RECOVERY_CODES: `${NEXT_API_DOCTOR_BASE}/regenerate-recovery-codes`,
    INVITE_PATIENT: `${NEXT_API_DOCTOR_BASE}/invite-patient`,
  },
  HEALTH_ASSISTANT: {
    LOGIN: `${NEXT_API_HEALTH_ASSISTANT_BASE}/login`,
    REGISTER: `${NEXT_API_HEALTH_ASSISTANT_BASE}/register`,
    SETUP_2FA: `${NEXT_API_HEALTH_ASSISTANT_BASE}/setup-2fa`,
    ENABLE_2FA: `${NEXT_API_HEALTH_ASSISTANT_BASE}/enable-2fa`,
    VERIFY_2FA: `${NEXT_API_HEALTH_ASSISTANT_BASE}/verify-2fa`,
    FORGOT_PASSWORD: `${NEXT_API_HEALTH_ASSISTANT_BASE}/forgot-password`,
    VERIFY_OTP: `${NEXT_API_HEALTH_ASSISTANT_BASE}/verify-reset-otp`,
    RESET_PASSWORD: `${NEXT_API_HEALTH_ASSISTANT_BASE}/reset-password`,
    REFRESH: `${NEXT_API_HEALTH_ASSISTANT_BASE}/refresh`,
    LOGOUT: `${NEXT_API_HEALTH_ASSISTANT_BASE}/logout`,
    SESSION: `${NEXT_API_HEALTH_ASSISTANT_BASE}/session`,
    CHANGE_PASSWORD: `${NEXT_API_HEALTH_ASSISTANT_BASE}/change-password`,
    DISABLE_2FA: `${NEXT_API_HEALTH_ASSISTANT_BASE}/disable-2fa`,
    REGENERATE_RECOVERY_CODES: `${NEXT_API_HEALTH_ASSISTANT_BASE}/regenerate-recovery-codes`,
    INVITE_PATIENT: `${NEXT_API_HEALTH_ASSISTANT_BASE}/invite-patient`,
  },
  PATIENT: {
    REGISTER: `${NEXT_API_PATIENT_BASE}/register`,
    LOGIN: `${NEXT_API_PATIENT_BASE}/login`,
    REFRESH: `${NEXT_API_PATIENT_BASE}/refresh`,
    LOGOUT: `${NEXT_API_PATIENT_BASE}/logout`,
    SESSION: `${NEXT_API_PATIENT_BASE}/session`,
    COMPLETE_REGISTRATION: `${NEXT_API_PATIENT_BASE}/complete-registration`,
    VERIFY_INVITATION: `${NEXT_API_PATIENT_BASE}/verify-invitation`,
  },
  CLEAR_COOKIES: `${NEXT_API_BASE}/clear-cookies`,
} as const;

export const API_ENDPOINTS = {
  register: NEXT_API_ROUTES.PATIENT.REGISTER,
  login: NEXT_API_ROUTES.PATIENT.LOGIN,
  doctorLogin: NEXT_API_ROUTES.DOCTOR.LOGIN,
  healthAssistantLogin: NEXT_API_ROUTES.HEALTH_ASSISTANT.LOGIN,
  setup2FA: NEXT_API_ROUTES.DOCTOR.SETUP_2FA,
  enable2FA: NEXT_API_ROUTES.DOCTOR.ENABLE_2FA,
  verify2FA: NEXT_API_ROUTES.DOCTOR.VERIFY_2FA,
  clearCookies: NEXT_API_ROUTES.CLEAR_COOKIES,
} as const;
