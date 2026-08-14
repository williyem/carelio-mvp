import { AxiosResponse } from 'axios';
import { apiClient, authApiClient } from '@/integration/config';
import { PATIENT_ENDPOINTS } from './endpoints';
import type {
  PatientLoginRequest,
  PatientLoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  InvitationToken,
  // VerifyInvitationRequest,
  VerifyInvitationResponse,
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,
  GetSessionResponse,
  LogoutResponse,
} from './types';

/**
 * Login patient
 */
export const loginPatient = async (
  data: PatientLoginRequest
): Promise<AxiosResponse<PatientLoginResponse>> => {
  // Hit Next BFF so login can set cookies in one step
  return apiClient.post<PatientLoginResponse>(PATIENT_ENDPOINTS.LOGIN, data);
};

/**
 * Refresh access token
 */
export const refreshToken = async (
  data: RefreshTokenRequest
): Promise<AxiosResponse<RefreshTokenResponse>> => {
  return apiClient.post<RefreshTokenResponse>(
    PATIENT_ENDPOINTS.REFRESH_TOKEN,
    data
  );
};

/**
 * Logout patient
 */
export const logoutPatient = async (): Promise<
  AxiosResponse<LogoutResponse>
> => {
  return apiClient.post<LogoutResponse>(PATIENT_ENDPOINTS.LOGOUT);
};

/**
 * Get current session
 */
export const getSession = async (): Promise<
  AxiosResponse<GetSessionResponse>
> => {
  return apiClient.get<GetSessionResponse>(PATIENT_ENDPOINTS.SESSION);
};

/**
 * Verify invitation token
 */
export const verifyInvitation = async (
  token: InvitationToken
): Promise<AxiosResponse<VerifyInvitationResponse>> => {
  return apiClient.get<VerifyInvitationResponse>(
    `${PATIENT_ENDPOINTS.VERIFY_INVITATION}?token=${token}`
  );
};

export const verifyConsent = async (
  token: InvitationToken
): Promise<AxiosResponse<VerifyInvitationResponse>> => {
  return apiClient.get<VerifyInvitationResponse>(
    `${PATIENT_ENDPOINTS.VERIFY_CONSENT}?token=${token}`
  );
};

export const verifyInvite = async (
  token: InvitationToken
): Promise<AxiosResponse<VerifyInvitationResponse>> => {
  return apiClient.get<VerifyInvitationResponse>(
    `${PATIENT_ENDPOINTS.VERIFY_INVITE}?token=${token}`
  );
};

/**
 * Complete patient registration
 */
export const completeRegistration = async (
  data: CompleteRegistrationRequest
): Promise<AxiosResponse<CompleteRegistrationResponse>> => {
  return apiClient.post<CompleteRegistrationResponse>(
    PATIENT_ENDPOINTS.COMPLETE_REGISTRATION,
    data
  );
};
