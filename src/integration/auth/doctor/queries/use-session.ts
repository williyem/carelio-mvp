'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getSession } from '../api-functions';
import type { GetSessionResponse } from '../types';
import { extractResponseData } from '@/integration/utils';

/**
 * Query key for doctor session
 */
export const DOCTOR_SESSION_QUERY_KEY = ['doctor', 'auth', 'session'] as const;

/**
 * Hook to get current doctor session
 */
export const useDoctorSession = (
  options?: Omit<
    UseQueryOptions<GetSessionResponse, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: DOCTOR_SESSION_QUERY_KEY,
    queryFn: async () => {
      const response = await getSession();
      return extractResponseData(response);
    },
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
};
