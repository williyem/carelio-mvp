'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAdminDoctor,
  createAdminHealthAssistant,
  setAdminDoctorActive,
  setAdminHealthAssistantActive,
  setAdminPatientActive,
} from './api-functions';
import { ADMIN_QUERY_KEYS } from './queries';
import type { CreateStaffRequest, SetActiveRequest } from './types';
import { PATIENT_QUERY_KEYS } from '@/integration/patient/query-keys';

export function useCreateAdminDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStaffRequest) => createAdminDoctor(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.DOCTORS,
      });
    },
  });
}

export function useCreateAdminHealthAssistant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStaffRequest) => createAdminHealthAssistant(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.HEALTH_ASSISTANTS,
      });
    },
  });
}

export function useSetAdminDoctorActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: SetActiveRequest & { id: string }) =>
      setAdminDoctorActive(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.DOCTORS,
      });
    },
  });
}

export function useSetAdminHealthAssistantActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: SetActiveRequest & { id: string }) =>
      setAdminHealthAssistantActive(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.HEALTH_ASSISTANTS,
      });
    },
  });
}

export function useSetAdminPatientActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: SetActiveRequest & { id: string }) =>
      setAdminPatientActive(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.PATIENTS,
      });
      void queryClient.invalidateQueries({
        queryKey: [PATIENT_QUERY_KEYS.SEARCH_PATIENTS],
      });
    },
  });
}
