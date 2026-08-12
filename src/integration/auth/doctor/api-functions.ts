import { AxiosResponse } from 'axios';
import { apiClient, authApiClient } from '@/integration/config';
import { DOCTOR_ENDPOINTS } from './endpoints';
import type {
  DoctorRegisterRequest,
  DoctorLoginRequest,
  DoctorLoginResponse,
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

export const registerDoctor = async (
  data: DoctorRegisterRequest
): Promise<AxiosResponse<DoctorLoginResponse>> => {
  return authApiClient.post<DoctorLoginResponse>(
    DOCTOR_ENDPOINTS.REGISTER,
    data
  );
};

export const loginDoctor = async (
  data: DoctorLoginRequest
): Promise<AxiosResponse<DoctorLoginResponse>> => {
  return authApiClient.post<DoctorLoginResponse>(DOCTOR_ENDPOINTS.LOGIN, data);
};

export const verify2FA = async (
  data: Verify2FARequest
): Promise<AxiosResponse<Verify2FAResponse>> => {
  return authApiClient.post<Verify2FAResponse>(
    DOCTOR_ENDPOINTS.VERIFY_2FA,
    data
  );
};

export const forgotPassword = async (
  data: ForgotPasswordRequest
): Promise<AxiosResponse<ForgotPasswordResponse>> => {
  return authApiClient.post<ForgotPasswordResponse>(
    DOCTOR_ENDPOINTS.FORGOT_PASSWORD,
    data
  );
};

export const verifyOtp = async (
  data: VerifyOtpRequest
): Promise<AxiosResponse<VerifyOtpResponse>> => {
  return apiClient.post<VerifyOtpResponse>(DOCTOR_ENDPOINTS.VERIFY_OTP, data);
};

export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<AxiosResponse<ResetPasswordResponse>> => {
  return apiClient.post<ResetPasswordResponse>(
    DOCTOR_ENDPOINTS.RESET_PASSWORD,
    data
  );
};

export const refreshToken = async (
  data: RefreshTokenRequest
): Promise<AxiosResponse<RefreshTokenResponse>> => {
  return authApiClient.post<RefreshTokenResponse>(
    DOCTOR_ENDPOINTS.REFRESH_TOKEN,
    data
  );
};

export const logoutDoctor = async (): Promise<
  AxiosResponse<LogoutResponse>
> => {
  return authApiClient.post<LogoutResponse>(DOCTOR_ENDPOINTS.LOGOUT);
};

export const changePassword = async (
  data: ChangePasswordRequest
): Promise<AxiosResponse<ChangePasswordResponse>> => {
  return authApiClient.post<ChangePasswordResponse>(
    DOCTOR_ENDPOINTS.CHANGE_PASSWORD,
    data
  );
};

export const setup2FA = async (
  data: Setup2FARequest
): Promise<AxiosResponse<Setup2FAResponse>> => {
  return authApiClient.post<Setup2FAResponse>(DOCTOR_ENDPOINTS.SETUP_2FA, data);
};

export const enable2FA = async (
  data: Enable2FARequest
): Promise<AxiosResponse<Enable2FAResponse>> => {
  return authApiClient.post<Enable2FAResponse>(
    DOCTOR_ENDPOINTS.ENABLE_2FA,
    data
  );
};

export const disable2FA = async (
  data: Disable2FARequest
): Promise<AxiosResponse<Disable2FAResponse>> => {
  return authApiClient.post<Disable2FAResponse>(
    DOCTOR_ENDPOINTS.DISABLE_2FA,
    data
  );
};

export const regenerateRecoveryCodes = async (
  data: RegenerateRecoveryCodesRequest
): Promise<AxiosResponse<RegenerateRecoveryCodesResponse>> => {
  return authApiClient.post<RegenerateRecoveryCodesResponse>(
    DOCTOR_ENDPOINTS.REGENERATE_RECOVERY_CODES,
    data
  );
};

export const getSession = async (): Promise<
  AxiosResponse<GetSessionResponse>
> => {
  return authApiClient.get<GetSessionResponse>(DOCTOR_ENDPOINTS.SESSION);
};

export const invitePatient = async (
  data: InvitePatientRequest
): Promise<AxiosResponse<InvitePatientResponse>> => {
  return apiClient.post<InvitePatientResponse>(
    DOCTOR_ENDPOINTS.INVITE_PATIENT,
    data
  );
};
