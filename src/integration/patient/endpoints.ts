export const PATIENT_ENDPOINTS = {
  SEARCH_PATIENTS: '/patients',
  GET_ASSIGNED_PATIENTS: '/patients/assigned',
  GET_PATIENT_BY_ID: '/patients/:id',
  ASSIGN_PATIENT: '/patients/assign',
  UNASSIGN_PATIENT: '/patients/:patientId/unassign',
  INVITE_PATIENT: '/auth/patient/invite',
} as const;

export const PATIENT_API_ENDPOINTS = {
  SEARCH_PATIENTS: '/doctor/patient/search',
  GET_ASSIGNED_PATIENTS: '/doctor/patient/assigned',
  GET_PATIENT_BY_ID: 'doctor/patient/:id/get',
  ASSIGN_PATIENT: '/doctor/patient/assign',
  UNASSIGN_PATIENT: '/patients/:patientId/unassign',
  INVITE_PATIENT: '/auth/patient/invite',
} as const;
