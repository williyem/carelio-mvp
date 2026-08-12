'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { verifyInvitation } from '../api-functions';
import type { VerifyInvitationResponse, InvitationToken } from '../types';
import { extractResponseData } from '@/integration/utils';

/**
 * Query key factory for verify invitation
 */
export const getVerifyInvitationQueryKey = (token: InvitationToken) =>
  ['patient', 'auth', 'verify-invitation', token] as const;

/**
 * Hook to verify invitation token
 */
export const useVerifyInvitation = (
  token: InvitationToken | null,
  options?: Omit<
    UseQueryOptions<VerifyInvitationResponse, Error>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) => {
  return useQuery({
    queryKey: getVerifyInvitationQueryKey(token!),
    queryFn: async () => {
      if (!token) throw new Error('Token is required');
      const response = await verifyInvitation(token);
      return extractResponseData(response);
    },
    enabled: !!token,
    retry: false,
    ...options,
  });
};
