export const PATIENT_QUERY_KEYS = {
  SEARCH_PATIENTS: 'SEARCH_PATIENTS',
  ASSIGNED_PATIENTS: 'ASSIGNED_PATIENTS',
  PATIENT_BY_ID: 'PATIENT_BY_ID',
  SEARCH_ASSIGNED_PATIENTS: (
    search: string,
    page: number,
    limit: number,
    assistantId: string
  ) =>
    [
      'patient',
      'assigned',
      'search',
      search,
      page,
      limit,
      assistantId,
    ] as const,
  GET_PATIENT_BY_ID: (patientId: string) =>
    ['patient', 'assigned', 'by-id', patientId] as const,
  GET_PATIENT_CONSULTATION_TOKEN: (patientId: string) =>
    ['patient', 'consultation', 'token', patientId] as const,
  SEARCH_UNASSIGNED_PATIENTS: (search: string, page: number, limit: number) =>
    ['patient', 'unassigned', 'search', search, page, limit] as const,
  SEARCH_ALL_PATIENTS: (search: string, page: number, limit: number) =>
    ['patient', 'all', 'search', search, page, limit] as const,
} as const;
