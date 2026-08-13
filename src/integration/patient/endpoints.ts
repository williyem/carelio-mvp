export const PATIENT_ENDPOINTS = {
  // Doctor portal
  SEARCH_PATIENTS: '/patients',
  GET_ASSIGNED_PATIENTS: '/patients/assigned',
  GET_PATIENT_BY_ID: '/patients/:id',
  ASSIGN_PATIENT: '/patients/assign',
  UNASSIGN_PATIENT: '/patients/:patientId/unassign',
  INVITE_PATIENT: '/auth/patient/invite',
  // Health assistant / patient portal
  SEARCH_ASSIGNED_PATIENTS: '/patients/assigned',
  GET_PATIENT_CONSULTATION_TOKEN: '/consultations/:id/token/patient',
  SUBMIT_CONSENT_FORM: '/patients/agreements',
  SUBMIT_CONSENT_AGREEMENT: '/patients/consent/agree',
  SEARCH_UNASSIGNED_PATIENTS: `/patients/unassigned`,
  SEARCH_ASSIGNED_HEALTH_ASSISTANTS: `/patients/health-assistant`,
} as const;

export const PATIENT_API_ENDPOINTS = {
  // Doctor portal (Next BFF)
  SEARCH_PATIENTS: '/doctor/patient/search',
  GET_ASSIGNED_PATIENTS: '/doctor/patient/assigned',
  GET_PATIENT_BY_ID: '/doctor/patient/:id/get',
  ASSIGN_PATIENT: '/doctor/patient/assign',
  UNASSIGN_PATIENT: '/patients/:patientId/unassign',
  INVITE_PATIENT: '/auth/patient/invite',
  // Health assistant (Next BFF)
  SEARCH_ASSIGNED_PATIENTS: '/health-assistant/patient/search',
  GET_PATIENT_CONSULTATION_TOKEN:
    '/health-assistant/patient/:id/consultation-token',
  SEARCH_ASSIGNED_HEALTH_ASSISTANTS_PATIENTS:
    '/health-assistant/patient/assigned',
  SEARCH_UNASSIGNED_PATIENTS: '/health-assistant/patient/unassigned',
  SEARCH_ASSIGNED_HEALTH_ASSISTANTS:
    '/health-assistant/patient/assistant/search',
  SEARCH_ALL: '/patients',
  SUBMIT_CONSENT_AGREEMENT: '/patients/consent/agree',
  HA_GET_PATIENT_BY_ID: '/health-assistant/patient/:id/get',
  HA_GET_PATIENT_APPOINTMENTS: '/health-assistant/appointments/:patientId',
  HA_SCHEDULE_APPOINTMENT: '/health-assistant/appointments/schedule',
} as const;
