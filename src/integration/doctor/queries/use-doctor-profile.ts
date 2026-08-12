'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getDoctorProfile } from '../api-function';
import { useRouter } from 'next/navigation';
import { useLogout } from '@/hooks/use-logout';
import { useEffect } from 'react';
import axios from 'axios';
import { DoctorUser } from '@/integration/auth/doctor';

/**
 * Query key for doctor profile
 */
export const DOCTOR_PROFILE_QUERY_KEY = ['doctor', 'profile'] as const;

/**
 * Hook to get current doctor profile
 */
export const useDoctorProfile = (
  options?: Omit<UseQueryOptions<DoctorUser, Error>, 'queryKey' | 'queryFn'>
) => {
  const router = useRouter();
  const logout = useLogout();

  const query = useQuery({
    queryKey: DOCTOR_PROFILE_QUERY_KEY,
    queryFn: async () => {
      return await getDoctorProfile();
    },
    retry: (failureCount, error) => {
      // Don't retry on 401 or 402 errors
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401 || status === 402) {
          return false;
        }
      }
      return failureCount < 1;
    },
    refetchOnWindowFocus: false,
    ...options,
  });

  // Handle 402 unauthorized error - logout user
  useEffect(() => {
    if (query.error && axios.isAxiosError(query.error)) {
      const status = query.error.response?.status;
      if (status === 402) {
        logout();
        router.push('/login');
      }
    }
  }, [query.error, logout, router]);

  return query;
};
