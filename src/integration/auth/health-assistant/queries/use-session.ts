'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getSession } from '../api-functions';
import type { GetSessionResponse } from '../types';
import { extractResponseData } from '@/integration/utils';

export const HEALTH_ASSISTANT_SESSION_QUERY_KEY = [
  'health-assistant',
  'auth',
  'session',
] as const;

// Legacy alias for backward compatibility
export const DOCTOR_SESSION_QUERY_KEY = HEALTH_ASSISTANT_SESSION_QUERY_KEY;

export const useHealthAssistantSession = (
  options?: Omit<
    UseQueryOptions<GetSessionResponse, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: HEALTH_ASSISTANT_SESSION_QUERY_KEY,
    queryFn: async () => {
      const response = await getSession();
      return extractResponseData(response);
    },
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Legacy alias for backward compatibility
export const useDoctorSession = useHealthAssistantSession;
