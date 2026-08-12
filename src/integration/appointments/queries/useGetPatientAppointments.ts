import { useQuery } from '@tanstack/react-query';
import { getPatientAppointments } from '../api-functions';
import { APPOINTMENT_QUERY_KEYS } from '../query-keys';

const useGetPatientAppointments = (
  patientId: string,
  status?: 'COMPLETED' | 'CONFIRMED' | 'CANCELLED' | 'MISSED',
  enabled: boolean = true,
  page: number = 1,
  limit: number = 10
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: APPOINTMENT_QUERY_KEYS.GET_PATIENT_APPOINTMENTS(
      patientId,
      status,
      page,
      limit
    ),
    queryFn: () => getPatientAppointments(patientId, status, page, limit),
    enabled: !!patientId && enabled,
  });

  return {
    data,
    appointments: data?.docs || [],
    isLoading,
    error,
  };
};

export default useGetPatientAppointments;
