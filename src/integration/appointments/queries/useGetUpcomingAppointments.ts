import { useQuery } from '@tanstack/react-query';
import { getUpcomingAppointments } from '@/integration/appointments/api-functions';
import { UpcomingAppointmentsResponse } from '@/integration/appointments/types';

export const GET_UPCOMING_APPOINTMENTS_QUERY_KEY = 'GET_UPCOMING_APPOINTMENTS';

const useGetUpcomingAppointments = (
  assistantId: string,
  page: number = 1,
  limit: number = 5,
  options: { enabled?: boolean } = {}
) => {
  return useQuery<UpcomingAppointmentsResponse, Error>({
    queryKey: [GET_UPCOMING_APPOINTMENTS_QUERY_KEY, assistantId, page, limit],
    queryFn: () => getUpcomingAppointments(page, limit),
    enabled: options.enabled ?? true,
  });
};

export default useGetUpcomingAppointments;
