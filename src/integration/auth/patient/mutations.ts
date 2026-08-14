'use client';

import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import {
  loginPatient,
  verifyPatientLoginEmail,
  forgotPatientPassword,
  resetPatientPassword,
  refreshToken,
  logoutPatient,
  completeRegistration,
} from './api-functions';
import type {
  PatientLoginRequest,
  PatientLoginResponse,
  PatientVerifyLoginEmailRequest,
  PatientForgotPasswordRequest,
  PatientResetPasswordRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,
} from './types';
import { extractResponseData } from '@/integration/utils';

/**
 * React Query mutation keys for patient auth
 */
export const PATIENT_MUTATION_KEYS = {
  LOGIN: ['patient', 'auth', 'login'] as const,
  VERIFY_LOGIN_EMAIL: ['patient', 'auth', 'verify-login-email'] as const,
  FORGOT_PASSWORD: ['patient', 'auth', 'forgot-password'] as const,
  RESET_PASSWORD: ['patient', 'auth', 'reset-password'] as const,
  REFRESH_TOKEN: ['patient', 'auth', 'refresh'] as const,
  LOGOUT: ['patient', 'auth', 'logout'] as const,
  COMPLETE_REGISTRATION: ['patient', 'auth', 'complete-registration'] as const,
} as const;

/**
 * Login patient mutation
 */
export const useLoginPatient = (
  options?: UseMutationOptions<PatientLoginResponse, Error, PatientLoginRequest>
) => {
  return useMutation({
    mutationKey: PATIENT_MUTATION_KEYS.LOGIN,
    mutationFn: async (data: PatientLoginRequest) => {
      const response = await loginPatient(data);
      return extractResponseData(response);
    },
    ...options,
  });
};

export const useVerifyPatientLoginEmail = (
  options?: UseMutationOptions<
    PatientLoginResponse,
    Error,
    PatientVerifyLoginEmailRequest
  >
) => {
  return useMutation({
    mutationKey: PATIENT_MUTATION_KEYS.VERIFY_LOGIN_EMAIL,
    mutationFn: async (data: PatientVerifyLoginEmailRequest) => {
      const response = await verifyPatientLoginEmail(data);
      return extractResponseData(response);
    },
    ...options,
  });
};

export const useForgotPatientPassword = (
  options?: UseMutationOptions<
    { message: string },
    Error,
    PatientForgotPasswordRequest
  >
) => {
  return useMutation({
    mutationKey: PATIENT_MUTATION_KEYS.FORGOT_PASSWORD,
    mutationFn: async (data: PatientForgotPasswordRequest) => {
      const response = await forgotPatientPassword(data);
      return extractResponseData(response);
    },
    ...options,
  });
};

export const useResetPatientPassword = (
  options?: UseMutationOptions<
    { message: string },
    Error,
    PatientResetPasswordRequest
  >
) => {
  return useMutation({
    mutationKey: PATIENT_MUTATION_KEYS.RESET_PASSWORD,
    mutationFn: async (data: PatientResetPasswordRequest) => {
      const response = await resetPatientPassword(data);
      return extractResponseData(response);
    },
    ...options,
  });
};

/**
 * Refresh token mutation
 */
export const useRefreshToken = (
  options?: UseMutationOptions<RefreshTokenResponse, Error, RefreshTokenRequest>
) => {
  return useMutation({
    mutationKey: PATIENT_MUTATION_KEYS.REFRESH_TOKEN,
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
export const useLogoutPatient = (
  options?: UseMutationOptions<void, Error, void>
) => {
  return useMutation({
    mutationKey: PATIENT_MUTATION_KEYS.LOGOUT,
    mutationFn: async () => {
      await logoutPatient();
    },
    ...options,
  });
};

/**
 * Complete registration mutation
 */
export const useCompleteRegistration = (
  options?: UseMutationOptions<
    CompleteRegistrationResponse,
    Error,
    CompleteRegistrationRequest
  >
) => {
  return useMutation({
    mutationKey: PATIENT_MUTATION_KEYS.COMPLETE_REGISTRATION,
    mutationFn: async (data: CompleteRegistrationRequest) => {
      const response = await completeRegistration(data);
      return extractResponseData(response);
    },
    ...options,
  });
};
