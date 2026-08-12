export const VITALS_QUERY_KEYS = {
  GET_BY_APPOINTMENT: (appointmentId: string) =>
    ['vitals', 'appointment', appointmentId] as const,
} as const;
