'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { completeRegistration } from '../api-functions';
import type {
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,
} from '../types';
import { extractResponseData } from '@/integration/utils';

/**
 * Query key factory for complete registration
 * Note: This is typically a mutation, but if you need to query registration status,
 * you can use this hook. Otherwise, use the mutation from mutations.ts
 */
export const getCompleteRegistrationQueryKey = (
  token: CompleteRegistrationRequest['token']
) => ['patient', 'auth', 'complete-registration', token] as const;

/**
 * Hook to complete patient registration
 * Note: This is typically a mutation. Use the mutation hook from mutations.ts instead.
 */
export const useCompleteRegistrationQuery = (
  data: CompleteRegistrationRequest | null,
  options?: Omit<
    UseQueryOptions<CompleteRegistrationResponse, Error>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) => {
  return useQuery({
    queryKey: getCompleteRegistrationQueryKey(
      data?.token ?? ('' as unknown as CompleteRegistrationRequest['token'])
    ),
    queryFn: async () => {
      if (!data) throw new Error('Registration data is required');
      const response = await completeRegistration(data);
      return extractResponseData(response);
    },
    enabled: false, // Disabled by default - use mutation instead
    ...options,
  });
};
