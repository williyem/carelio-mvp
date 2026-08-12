'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { verifyConsent } from '../api-functions';
import type { VerifyInvitationResponse, InvitationToken } from '../types';
import { extractResponseData } from '@/integration/utils';

/**
 * Query key factory for verify invitation
 */
export const getVerifyConsentQueryKey = (token: InvitationToken) =>
  ['patient', 'auth', 'verify-consent', token] as const;

/**
 * Hook to verify consent token
 */
export const useVerifyConsent = (
  token: InvitationToken | null,
  isOnboardingComplete: boolean,
  options?: Omit<
    UseQueryOptions<VerifyInvitationResponse, Error>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) => {
  return useQuery({
    queryKey: getVerifyConsentQueryKey(token!),
    queryFn: async () => {
      if (!token) {
        throw new Error('Not authorized. Please contact administrator');
      }
      const response = await verifyConsent(token);
      return extractResponseData(response);
    },
    enabled: !!token && !isOnboardingComplete,
    retry: false,
    ...options,
  });
};
