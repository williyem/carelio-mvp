/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import {
  registerDoctor,
  loginDoctor,
  verify2FA,
  forgotPassword,
  verifyOtp,
  resetPassword,
  refreshToken,
  logoutDoctor,
  changePassword,
  setup2FA,
  enable2FA,
  disable2FA,
  regenerateRecoveryCodes,
  invitePatient,
} from './api-functions';
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
  InvitePatientRequest,
  InvitePatientResponse,
} from './types';
import { extractResponseData } from '@/integration/utils';

/**
 * React Query mutation keys for doctor auth
 */
export const DOCTOR_MUTATION_KEYS = {
  REGISTER: ['doctor', 'auth', 'register'] as const,
  LOGIN: ['doctor', 'auth', 'login'] as const,
  VERIFY_2FA: ['doctor', 'auth', 'verify-2fa'] as const,
  FORGOT_PASSWORD: ['doctor', 'auth', 'forgot-password'] as const,
  VERIFY_OTP: ['doctor', 'auth', 'verify-otp'] as const,
  RESET_PASSWORD: ['doctor', 'auth', 'reset-password'] as const,
  REFRESH_TOKEN: ['doctor', 'auth', 'refresh'] as const,
  LOGOUT: ['doctor', 'auth', 'logout'] as const,
  CHANGE_PASSWORD: ['doctor', 'auth', 'change-password'] as const,
  SETUP_2FA: ['doctor', 'auth', 'setup-2fa'] as const,
  ENABLE_2FA: ['doctor', 'auth', 'enable-2fa'] as const,
  DISABLE_2FA: ['doctor', 'auth', 'disable-2fa'] as const,
  REGENERATE_RECOVERY_CODES: [
    'doctor',
    'auth',
    'regenerate-recovery-codes',
  ] as const,
  INVITE_PATIENT: ['doctor', 'auth', 'invite-patient'] as const,
} as const;

/**
 * Register doctor mutation
 */
export const useRegisterDoctor = (
  options?: UseMutationOptions<
    DoctorLoginResponse,
    Error,
    DoctorRegisterRequest
  >
) => {
  return useMutation({
    mutationKey: DOCTOR_MUTATION_KEYS.REGISTER,
    mutationFn: async (data: DoctorRegisterRequest) => {
      const response = await registerDoctor(data);
      return extractResponseData(response);
    },
    ...options,
  });
};

/**
 * Login doctor mutation
 */
export const useLoginDoctor = (
  options?: UseMutationOptions<any, Error, DoctorLoginRequest>
) => {
  return useMutation({
    mutationKey: DOCTOR_MUTATION_KEYS.LOGIN,
    mutationFn: async (data: DoctorLoginRequest) => {
      const response = await loginDoctor(data);
      return extractResponseData(response);
    },
    ...options,
  });
};

/**
 * Verify 2FA mutation
 */
export const useVerify2FA = (
  options?: UseMutationOptions<Verify2FAResponse, Error, Verify2FARequest>
) => {
  return useMutation({
    mutationKey: DOCTOR_MUTATION_KEYS.VERIFY_2FA,
    mutationFn: async (data: Verify2FARequest) => {
      const response = await verify2FA(data);
      return extractResponseData(response);
    },
    ...options,
  });
};

/**
 * Forgot password mutation
 */
export const useForgotPassword = (
  options?: UseMutationOptions<
    ForgotPasswordResponse,
    Error,
    ForgotPasswordRequest
  >
) => {
  return useMutation({
    mutationKey: DOCTOR_MUTATION_KEYS.FORGOT_PASSWORD,
    mutationFn: async (data: ForgotPasswordRequest) => {
      const response = await forgotPassword(data);
      return extractResponseData(response);
    },
    ...options,
  });
};

/**
 * Reset password mutation
 */
export const useResetPassword = (
  options?: UseMutationOptions<
    ResetPasswordResponse,
    Error,
    ResetPasswordRequest
  >
) => {
  return useMutation({
    mutationKey: DOCTOR_MUTATION_KEYS.RESET_PASSWORD,
    mutationFn: async (data: ResetPasswordRequest) => {
      const response = await resetPassword(data);
      return extractResponseData(response);
    },
    ...options,
  });
};
/**
 * Verify OTP mutation
 */
export const useVerifyOtp = (
  options?: UseMutationOptions<VerifyOtpResponse, Error, VerifyOtpRequest>
) => {
  return useMutation({
    mutationKey: DOCTOR_MUTATION_KEYS.VERIFY_OTP,
    mutationFn: async (data: VerifyOtpRequest) => {
      const response = await verifyOtp(data);
      return extractResponseData(response);
    },
    ...options,
  });
};

/**
 * Reset password mutation
 */

/**
 * Refresh token mutation
 */
export const useRefreshToken = (
  options?: UseMutationOptions<RefreshTokenResponse, Error, RefreshTokenRequest>
) => {
  return useMutation({
    mutationKey: DOCTOR_MUTATION_KEYS.REFRESH_TOKEN,
    mutationFn: async (data: RefreshTokenRequest) => {
      const response = await refreshToken(data);
      return extractResponseData(response);
    },
    ...options,
  });
};

/**
 * Logout mutation
 */
export const useLogoutDoctor = (
  options?: UseMutationOptions<void, Error, void>
) => {
  return useMutation({
    mutationKey: DOCTOR_MUTATION_KEYS.LOGOUT,
    mutationFn: async () => {
      await logoutDoctor();
    },
    ...options,
  });
};

/**
 * Change password mutation
 */
export const useChangePassword = (
  options?: UseMutationOptions<
    ChangePasswordResponse,
    Error,
    ChangePasswordRequest
  >
) => {
  return useMutation({
    mutationKey: DOCTOR_MUTATION_KEYS.CHANGE_PASSWORD,
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await changePassword(data);
      return extractResponseData(response);
    },
    ...options,
  });
};

/**
 * Setup 2FA mutation
 */
export const useSetup2FA = (
  options?: UseMutationOptions<Setup2FAResponse, Error, Setup2FARequest>
) => {
  return useMutation({
    mutationKey: DOCTOR_MUTATION_KEYS.SETUP_2FA,
    mutationFn: async (data: Setup2FARequest) => {
      const response = await setup2FA(data);
      return extractResponseData(response);
    },
    ...options,
  });
};

/**
 * Enable 2FA mutation
 */
export const useEnable2FA = (
  options?: UseMutationOptions<Enable2FAResponse, Error, Enable2FARequest>
) => {
  return useMutation({
    mutationKey: DOCTOR_MUTATION_KEYS.ENABLE_2FA,
    mutationFn: async (data: Enable2FARequest) => {
      const response = await enable2FA(data);
      return extractResponseData(response);
    },
    ...options,
  });
};

/**
 * Disable 2FA mutation
 */
export const useDisable2FA = (
  options?: UseMutationOptions<Disable2FAResponse, Error, Disable2FARequest>
) => {
  return useMutation({
    mutationKey: DOCTOR_MUTATION_KEYS.DISABLE_2FA,
    mutationFn: async (data: Disable2FARequest) => {
      const response = await disable2FA(data);
      return extractResponseData(response);
    },
    ...options,
  });
};

/**
 * Regenerate recovery codes mutation
 */
export const useRegenerateRecoveryCodes = (
  options?: UseMutationOptions<
    RegenerateRecoveryCodesResponse,
    Error,
    RegenerateRecoveryCodesRequest
  >
) => {
  return useMutation({
    mutationKey: DOCTOR_MUTATION_KEYS.REGENERATE_RECOVERY_CODES,
    mutationFn: async (data: RegenerateRecoveryCodesRequest) => {
      const response = await regenerateRecoveryCodes(data);
      return extractResponseData(response);
    },
    ...options,
  });
};

/**
 * Invite patient mutation
 */
export const useInvitePatient = (
  options?: UseMutationOptions<
    InvitePatientResponse,
    Error,
    InvitePatientRequest
  >
) => {
  return useMutation({
    mutationKey: DOCTOR_MUTATION_KEYS.INVITE_PATIENT,
    mutationFn: async (data: InvitePatientRequest) => {
      const response = await invitePatient(data);
      return extractResponseData(response);
    },
    ...options,
  });
};
