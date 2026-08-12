import { useQuery } from '@tanstack/react-query';
import { VITALS_QUERY_KEYS } from '../query-keys';
import { getVitalsByAppointment } from '../api-function';

const useGetVitalsByAppointmentQuery = (appointmentId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: VITALS_QUERY_KEYS.GET_BY_APPOINTMENT(appointmentId),
    queryFn: () => getVitalsByAppointment(appointmentId),
    enabled: !!appointmentId,
  });

  return {
    vitals: data,
    data,
    isLoading,
    error,
    refetch,
  };
};

export default useGetVitalsByAppointmentQuery;
