import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVital, confirmVitals, rejectVitals } from './api-function';
import { VITALS_QUERY_KEYS } from './query-keys';
import { ConfirmVitalsRequest } from './type';

export function useCreateVital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVital,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: VITALS_QUERY_KEYS.GET_BY_APPOINTMENT(data.appointmentId),
      });
    },
  });
}

export function useRejectVitals(appointmentId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vitalIds: string[]) =>
      rejectVitals(appointmentId!, { vitalIds }),
    onSuccess: () => {
      if (!appointmentId) return;
      queryClient.invalidateQueries({
        queryKey: VITALS_QUERY_KEYS.GET_BY_APPOINTMENT(appointmentId),
      });
    },
  });
}

const useVitalsMutations = () => {
  const queryClient = useQueryClient();

  const createVitalMutation = useCreateVital();

  const confirmVitalsMutation = useMutation({
    mutationFn: ({
      appointmentId,
      data,
    }: {
      appointmentId: string;
      data: ConfirmVitalsRequest;
    }) => confirmVitals(appointmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: VITALS_QUERY_KEYS.GET_BY_APPOINTMENT(variables.appointmentId),
      });
    },
  });

  return {
    createVitalMutation,
    confirmVitalsMutation,
  };
};

export default useVitalsMutations;
