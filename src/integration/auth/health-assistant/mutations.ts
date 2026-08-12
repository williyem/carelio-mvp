'use client';

import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import {
  registerHealthAssistant,
  loginHealthAssistant,
  refreshToken,
  logoutHealthAssistant,
} from './api-functions';
import type {
  HealthAssistantRegisterRequest,
  HealthAssistantLoginRequest,
  HealthAssistantLoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from './types';
import { extractResponseData } from '@/integration/utils';

/**
 * React Query mutation keys for health assistant auth
 */
export const HEALTH_ASSISTANT_MUTATION_KEYS = {
  REGISTER: ['health-assistant', 'auth', 'register'] as const,
  LOGIN: ['health-assistant', 'auth', 'login'] as const,
  REFRESH_TOKEN: ['health-assistant', 'auth', 'refresh'] as const,
  LOGOUT: ['health-assistant', 'auth', 'logout'] as const,
} as const;

/**
 * Register health assistant mutation
 */
export const useRegisterHealthAssistant = (
  options?: UseMutationOptions<
    HealthAssistantLoginResponse,
    Error,
    HealthAssistantRegisterRequest
  >
) => {
  return useMutation({
    mutationKey: HEALTH_ASSISTANT_MUTATION_KEYS.REGISTER,
    mutationFn: async (data: HealthAssistantRegisterRequest) => {
      const response = await registerHealthAssistant(data);
      return extractResponseData(response);
    },
    ...options,
  });
};

/**
 * Login health assistant mutation
 */
export const useLoginHealthAssistant = (
  options?: UseMutationOptions<
    HealthAssistantLoginResponse,
    Error,
    HealthAssistantLoginRequest
  >
) => {
  return useMutation({
    mutationKey: HEALTH_ASSISTANT_MUTATION_KEYS.LOGIN,
    mutationFn: async (data: HealthAssistantLoginRequest) => {
      const response = await loginHealthAssistant(data);
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
    mutationKey: HEALTH_ASSISTANT_MUTATION_KEYS.REFRESH_TOKEN,
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
export const useLogoutHealthAssistant = (
  options?: UseMutationOptions<void, Error, void>
) => {
  return useMutation({
    mutationKey: HEALTH_ASSISTANT_MUTATION_KEYS.LOGOUT,
    mutationFn: async () => {
      await logoutHealthAssistant();
    },
    ...options,
  });
};
