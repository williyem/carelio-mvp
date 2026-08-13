import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAppointmentById,
  scheduleAppointment,
  schedulePatientAppointment,
} from './api-functions';
import type { ScheduleAppointmentRequest } from './types';

const useAppointmentMutations = (portal: 'staff' | 'patient' = 'staff') => {
  const queryClient = useQueryClient();

  const scheduleAppointmentMutation = useMutation({
    mutationFn: (data: ScheduleAppointmentRequest) =>
      portal === 'patient'
        ? schedulePatientAppointment(data)
        : scheduleAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['appointments', 'patient'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['patient', 'appointments'],
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
