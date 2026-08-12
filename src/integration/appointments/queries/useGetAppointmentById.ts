import { useQuery } from '@tanstack/react-query';
import { getAppointmentById } from '../api-functions';
import { APPOINTMENT_QUERY_KEYS } from '../query-keys';

export const useGetAppointmentById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [APPOINTMENT_QUERY_KEYS.APPOINTMENT_BY_ID, id],
    queryFn: () => getAppointmentById(id),
    enabled: !!id && enabled,
  });
};
