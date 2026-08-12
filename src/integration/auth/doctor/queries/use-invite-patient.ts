'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { invitePatient } from '../api-functions';
import type { InvitePatientRequest, InvitePatientResponse } from '../types';
import { extractResponseData } from '@/integration/utils';

/**
 * Query key factory for invite patient
 */
export const getInvitePatientQueryKey = (email: string) =>
  ['doctor', 'auth', 'invite-patient', email] as const;

/**
 * Hook to check patient invitation status
 * Note: This is typically a mutation, but if you need to query invitation status,
 * you can use this hook. Otherwise, use the mutation from mutations.ts
 */
export const useInvitePatientQuery = (
  email: string,
  options?: Omit<
    UseQueryOptions<InvitePatientResponse, Error>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) => {
  return useQuery({
    queryKey: getInvitePatientQueryKey(email),
    queryFn: async () => {
      const response = await invitePatient({ email });
      return extractResponseData(response);
    },
    enabled: false, // Disabled by default - use mutation instead
    ...options,
  });
};
