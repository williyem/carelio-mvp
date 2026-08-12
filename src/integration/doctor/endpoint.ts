export const DOCTOR_ENDPOINTS = {
  GET_DOCTOR_CONSULTATION_TOKEN: '/consultations/:id/token/doctor',
  PROFILE: '/doctor/profile',
} as const;

export const DOCTOR_API_ENDPOINTS = {
  GET_DOCTOR_CONSULTATION_TOKEN: '/doctor/:id/consultation/token',
  PROFILE: '/doctor/profile',
};
