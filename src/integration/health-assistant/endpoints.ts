export const HEALTH_ASSISTANT_ENDPOINTS = {
  REGISTER_PATIENT: '/patients',
  GET_HEALTH_ASSISTANTS: '/health-assistants',
  ASSIGN_HEALTH_ASSISTANT: '/patients/assign',
  VERIFY_PATIENT_PHONE: '/patients/:id/verify/phone',
  VERIFY_PATIENT_EMAIL: '/patients/:id/verify/email',
  VERIFY_PATIENT_CODE: '/patients/:id/verify/code',
} as const;

export const HEALTH_ASSISTANT_API_ENDPOINTS = {
  GET_HEALTH_ASSISTANTS: '/health-assistant/get',
  ASSIGN_HEALTH_ASSISTANT: '/health-assistant/assign',
} as const;
