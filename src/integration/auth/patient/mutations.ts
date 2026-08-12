'use client';

import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import {
  loginPatient,
  refreshToken,
  logoutPatient,
  completeRegistration,
} from './api-functions';
import type {
  PatientLoginRequest,
  PatientLoginResponse,
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
