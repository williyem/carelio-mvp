'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getSession } from '../api-functions';
import type { GetSessionResponse } from '../types';
import { extractResponseData } from '@/integration/utils';

/**
 * Query key for patient session
 */
export const PATIENT_SESSION_QUERY_KEY = [
  'patient',
  'auth',
  'session',
] as const;

/**
 * Hook to get current patient session
 */
export const usePatientSession = (
  options?: Omit<
    UseQueryOptions<GetSessionResponse, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: PATIENT_SESSION_QUERY_KEY,
    queryFn: async () => {
      const response = await getSession();
      return extractResponseData(response);
    },
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
};
