import { AxiosResponse } from 'axios';
import { apiClient, authApiClient } from '@/integration/config';
import {
  HEALTH_ASSISTANT_API_ENDPOINTS,
  HEALTH_ASSISTANT_ENDPOINTS,
} from './endpoints';
import type {
  HealthAssistantRegisterRequest,
  HealthAssistantLoginRequest,
  HealthAssistantLoginResponse,
  Verify2FARequest,
  Verify2FAResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  Setup2FARequest,
  Setup2FAResponse,
  Enable2FARequest,
  Enable2FAResponse,
  Disable2FARequest,
  Disable2FAResponse,
  RegenerateRecoveryCodesRequest,
  RegenerateRecoveryCodesResponse,
  GetSessionResponse,
  InvitePatientRequest,
  InvitePatientResponse,
  LogoutResponse,
} from './types';

export const registerHealthAssistant = async (
  data: HealthAssistantRegisterRequest
): Promise<AxiosResponse<HealthAssistantLoginResponse>> => {
  return authApiClient.post<HealthAssistantLoginResponse>(
    HEALTH_ASSISTANT_ENDPOINTS.REGISTER,
    data
  );
};

export const loginHealthAssistant = async (
  data: HealthAssistantLoginRequest
): Promise<AxiosResponse<HealthAssistantLoginResponse>> => {
  // Always hit the Next BFF so dummy mode and cookie-setting stay consistent
  return apiClient.post<HealthAssistantLoginResponse>(
    '/auth/health-assistant/login',
    data
  );
};

export const verify2FA = async (
  data: Verify2FARequest
): Promise<AxiosResponse<Verify2FAResponse>> => {
  return authApiClient.post<Verify2FAResponse>(
    HEALTH_ASSISTANT_ENDPOINTS.VERIFY_2FA,
    data
  );
};

export const forgotPassword = async (
  data: ForgotPasswordRequest
): Promise<AxiosResponse<ForgotPasswordResponse>> => {
  return authApiClient.post<ForgotPasswordResponse>(
    HEALTH_ASSISTANT_ENDPOINTS.FORGOT_PASSWORD,
    data
  );
};

export const verifyOtp = async (
  data: VerifyOtpRequest
): Promise<AxiosResponse<VerifyOtpResponse>> => {
  return apiClient.post<VerifyOtpResponse>(
    HEALTH_ASSISTANT_ENDPOINTS.VERIFY_OTP,
    data
  );
};

export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<AxiosResponse<ResetPasswordResponse>> => {
  return apiClient.post<ResetPasswordResponse>(
    HEALTH_ASSISTANT_API_ENDPOINTS.RESET_PASSWORD,
    data
  );
};

export const refreshToken = async (
  data: RefreshTokenRequest
): Promise<AxiosResponse<RefreshTokenResponse>> => {
  return authApiClient.post<RefreshTokenResponse>(
    HEALTH_ASSISTANT_ENDPOINTS.REFRESH_TOKEN,
    data
  );
};

export const logoutHealthAssistant = async (): Promise<
  AxiosResponse<LogoutResponse>
> => {
  return authApiClient.post<LogoutResponse>(HEALTH_ASSISTANT_ENDPOINTS.LOGOUT);
};

export const changePassword = async (
  data: ChangePasswordRequest
): Promise<AxiosResponse<ChangePasswordResponse>> => {
  return authApiClient.post<ChangePasswordResponse>(
    HEALTH_ASSISTANT_ENDPOINTS.CHANGE_PASSWORD,
    data
  );
};

export const setup2FA = async (
  data: Setup2FARequest
): Promise<AxiosResponse<Setup2FAResponse>> => {
  return authApiClient.post<Setup2FAResponse>(
    HEALTH_ASSISTANT_ENDPOINTS.SETUP_2FA,
    data
  );
};

export const enable2FA = async (
  data: Enable2FARequest
): Promise<AxiosResponse<Enable2FAResponse>> => {
  return authApiClient.post<Enable2FAResponse>(
    HEALTH_ASSISTANT_ENDPOINTS.ENABLE_2FA,
    data
  );
};

export const disable2FA = async (
  data: Disable2FARequest
): Promise<AxiosResponse<Disable2FAResponse>> => {
  return authApiClient.post<Disable2FAResponse>(
    HEALTH_ASSISTANT_ENDPOINTS.DISABLE_2FA,
    data
  );
};

export const regenerateRecoveryCodes = async (
  data: RegenerateRecoveryCodesRequest
): Promise<AxiosResponse<RegenerateRecoveryCodesResponse>> => {
  return authApiClient.post<RegenerateRecoveryCodesResponse>(
    HEALTH_ASSISTANT_ENDPOINTS.REGENERATE_RECOVERY_CODES,
    data
  );
};

export const getSession = async (): Promise<
  AxiosResponse<GetSessionResponse>
> => {
  return authApiClient.get<GetSessionResponse>(
    HEALTH_ASSISTANT_ENDPOINTS.SESSION
  );
};

export const invitePatient = async (
  data: InvitePatientRequest
): Promise<AxiosResponse<InvitePatientResponse>> => {
  return authApiClient.post<InvitePatientResponse>(
    HEALTH_ASSISTANT_ENDPOINTS.INVITE_PATIENT,
    data
  );
};
