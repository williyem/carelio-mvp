export const doctorCookieObj = 'doctorObj';
export const doctorAccessToken = 'doctorAToken';
export const doctorRefreshToken = 'doctorRToken';
export const doctorTempToken = 'doctorTempToken';
export const patientCookieObj = 'patientObj';
export const patientAccessToken = 'patientAToken';
export const patientRefreshToken = 'patientRToken';
export const healthAssistantCookieObj = 'healthAssistantObj';
export const healthAssistantAccessToken = 'healthAssistantAToken';
export const healthAssistantRefreshToken = 'healthAssistantRToken';
export const healthAssistantTempToken = 'healthAssistantTempToken';

export const APPOINTMENT_STATUS = {
  pending: 'PENDING_CONFIRMATION',
  rejected: 'REJECTED',
  accepted: 'CONFIRMED',
  declined: 'DECLINED',
  completed: 'COMPLETED',
};

// export const userTypeHeader = {
//   'x-user-type': 'patient',
// };

// export const DEFAULT_AVATAR = 'upload.wikimedia';

export const USER_TYPE: Record<
  string,
  'doctor' | 'patient' | 'healthAssistant'
> = {
  doctor: 'doctor',
  patient: 'patient',
  healthAssistant: 'healthAssistant',
};

export const USER_TYPE_HEADER = {
  'x-user-type': 'doctor',
};
export const DEFAULT_PAGE = 1; export const DEFAULT_LIMIT = 10;
