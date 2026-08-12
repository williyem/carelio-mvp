import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppointmentById, scheduleAppointment } from './api-functions';
import type { ScheduleAppointmentRequest } from './types';

const useAppointmentMutations = () => {
  const queryClient = useQueryClient();

  const scheduleAppointmentMutation = useMutation({
    mutationFn: (data: ScheduleAppointmentRequest) => scheduleAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['appointments', 'patient'],
        exact: false,
      });
    },
  });

  const getAppointmentByIdMutation = useMutation({
    mutationFn: (id: string) => getAppointmentById(id),
  });

  return {
    scheduleAppointmentMutation,
    getAppointmentByIdMutation,
  };
};

export default useAppointmentMutations;
