import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignPatient, unassignPatient, invitePatient } from './api-function';
import { PATIENT_QUERY_KEYS } from './query-keys';
import type { AssignPatientRequest, InvitePatientRequest } from './type';

export const useAssignPatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignPatientRequest) => assignPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PATIENT_QUERY_KEYS.SEARCH_PATIENTS],
      });
      queryClient.invalidateQueries({
        queryKey: [PATIENT_QUERY_KEYS.ASSIGNED_PATIENTS],
      });
    },
  });
};

export const useUnassignPatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: string) => unassignPatient(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PATIENT_QUERY_KEYS.SEARCH_PATIENTS],
      });
      queryClient.invalidateQueries({
        queryKey: [PATIENT_QUERY_KEYS.ASSIGNED_PATIENTS],
      });
    },
  });
};

export const useInvitePatient = () => {
  return useMutation({
    mutationFn: (data: InvitePatientRequest) => invitePatient(data),
  });
};
