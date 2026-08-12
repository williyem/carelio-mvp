export const VITALS_ENDPOINTS = {
  CREATE: '/vitals',
  GET_BY_APPOINTMENT: '/vitals/appointment/:appointmentId',
  CONFIRM: '/vitals/appointment/:appointmentId/confirm',
} as const;

export const VITALS_API_ENDPOINTS = {
  CREATE: '/vitals/create',
  GET_BY_APPOINTMENT: '/vitals/appointment/:appointmentId/get',
  CONFIRM: '/vitals/appointment/:appointmentId/confirm',
} as const;
