'use client';

import { useQuery } from '@tanstack/react-query';
import {
  listAdminDoctors,
  listAdminHealthAssistants,
  listAdminPatients,
} from './api-functions';

export const ADMIN_QUERY_KEYS = {
  DOCTORS: ['admin', 'doctors'] as const,
  HEALTH_ASSISTANTS: ['admin', 'health-assistants'] as const,
  PATIENTS: ['admin', 'patients'] as const,
};

export function useAdminDoctors(enabled: boolean) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.DOCTORS,
    queryFn: listAdminDoctors,
    enabled,
  });
}

export function useAdminHealthAssistants(enabled: boolean) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.HEALTH_ASSISTANTS,
    queryFn: listAdminHealthAssistants,
    enabled,
  });
}

export function useAdminPatients(enabled: boolean) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.PATIENTS,
    queryFn: listAdminPatients,
    enabled,
  });
}
