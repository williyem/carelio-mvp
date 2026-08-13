import { useQuery } from '@tanstack/react-query';
import { getMyPatientAppointments } from '../api-functions';

export const getMyPatientAppointmentsQueryKey = (
  patientId: string,
  status?: string
) => ['patient', 'appointments', patientId, status ?? 'all'] as const;

const useGetMyPatientAppointments = (
  patientId: string | undefined,
  status?: 'COMPLETED' | 'CONFIRMED' | 'CANCELLED' | 'MISSED',
  enabled: boolean = true
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: getMyPatientAppointmentsQueryKey(patientId ?? '', status),
    queryFn: () => getMyPatientAppointments(patientId!, status, 1, 50),
    enabled: !!patientId && enabled,
  });

  return {
    data,
    appointments: data?.docs || [],
    isLoading,
    error,
    refetch,
  };
};

export default useGetMyPatientAppointments;
