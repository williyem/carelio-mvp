import { useQuery } from '@tanstack/react-query';
import { getRecentAppointments } from '../api-functions';
import { APPOINTMENT_QUERY_KEYS } from '../query-keys';

export const useGetRecentAppointments = () => {
  return useQuery({
    queryKey: [APPOINTMENT_QUERY_KEYS.RECENT_APPOINTMENTS],
    queryFn: () => getRecentAppointments(),
  });
};
