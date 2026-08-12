export const APPOINTMENT_ENDPOINTS = {
  GET_DOCTOR_APPOINTMENTS: '/appointments',
  GET_APPOINTMENT_BY_ID: '/consultations/appointments/:id',
  CREATE_APPOINTMENT: '/appointments',
  CANCEL_APPOINTMENT: '/appointments/:id/cancel',
  GET_PATIENT_NOTES: '/patients/:patientId/notes',
  GET_NOTE_BY_ID: '/appointments/notes/detail/:noteId',
  GET_APPOINTMENT_NOTE: '/appointments/:appointmentId/note',
  GET_RECENT_APPOINTMENTS: '/appointments/recent',
  // Backwards compatibility
  GET_PATIENT_APPOINTMENTS: '/patients/:patientId/appointments',
  SCHEDULE_APPOINTMENT: '/appointments',
  SUBMIT_SOAP_NOTES: '/consultations/:appointmentId/soap',
  COMPLETE_CONSULTATION: '/consultations/:appointmentId/complete',
  UPDATE_CONSULTATION_NOTE: '/consultations/notes/:noteId',
} as const;

export const APPOINTMENT_API_ENDPOINTS = {
  GET_DOCTOR_APPOINTMENTS: '/doctor/appointments/get',
  GET_APPOINTMENT_BY_ID: 'doctor/:id/consultation/appointment',
  CREATE_APPOINTMENT: '/doctor/appointments/schedule',
  CANCEL_APPOINTMENT: '/doctor/appointments/cancel/:id',
  GET_PATIENT_NOTES: '/doctor/appointments/:patientId/health-records',
  GET_NOTE_BY_ID: '/doctor/appointments/notes/detail/:noteId',
  GET_APPOINTMENT_NOTE: '/doctor/consultations/:appointmentId/note',
  GET_RECENT_APPOINTMENTS: '/doctor/appointments/recent',
  RESCHEDULE_APPOINTMENT: '/doctor/appointments/reschedule/:id',
  // Backwards compatibility
  GET_PATIENT_APPOINTMENTS: '/doctor/appointments/:patientId/get',
  SCHEDULE_APPOINTMENT: '/doctor/appointments/schedule',
  SUBMIT_SOAP_NOTES: '/doctor/consultations/:appointmentId/soap',
  COMPLETE_CONSULTATION: '/doctor/consultations/:appointmentId/complete',
  UPDATE_CONSULTATION_NOTE: '/doctor/consultations/notes/:noteId',
} as const;
