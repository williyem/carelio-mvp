export const APPOINTMENT_QUERY_KEYS = {
  DOCTOR_APPOINTMENTS: 'doctorAppointments',
  PATIENT_APPOINTMENTS: 'patientAppointments',
  APPOINTMENT: 'appointment',
  PATIENT_NOTES: 'patientNotes',
  APPOINTMENT_NOTE: 'appointmentNote',
  RECENT_APPOINTMENTS: 'recentAppointments',
  APPOINTMENT_BY_ID: 'appointmentById',
  // Backwards compatibility - function style key
  GET_PATIENT_APPOINTMENTS: (
    patientId: string,
    status?: string,
    page?: number,
    limit?: number
  ) => ['appointments', 'patient', status, patientId, { page, limit }] as const,
} as const;

export { APPOINTMENT_QUERY_KEYS as default };
