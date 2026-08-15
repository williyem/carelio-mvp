export const HEALTH_ASSISTANT_ENDPOINTS = {
  REGISTER_PATIENT: '/patients',
  GET_HEALTH_ASSISTANTS: '/health-assistants',
  VERIFY_PATIENT_PHONE: '/patients/:id/verify/phone',
  VERIFY_PATIENT_EMAIL: '/patients/:id/verify/email',
  VERIFY_PATIENT_CODE: '/patients/:id/verify/code',
} as const;

export const HEALTH_ASSISTANT_API_ENDPOINTS = {
  REGISTER_PATIENT: '/health-assistant/patient/register',
  GET_HEALTH_ASSISTANTS: '/health-assistant/get',
  VERIFY_PATIENT_PHONE: '/health-assistant/patient/:id/verify/phone',
  VERIFY_PATIENT_EMAIL: '/health-assistant/patient/:id/verify/email',
  VERIFY_PATIENT_CODE: '/health-assistant/patient/:id/verify/code',
  GET_DOCTORS: '/health-assistant/doctors',
  GET_STATS: '/health-assistant/stats',
  PROFILE: '/health-assistant/profile',
} as const;
