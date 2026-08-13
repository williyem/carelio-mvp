import { useQuery } from '@tanstack/react-query';
import {
  getHealthAssistantPatientAppointments,
  getPatientAppointments,
} from '../api-functions';
import { APPOINTMENT_QUERY_KEYS } from '../query-keys';

type AppointmentsPortal = 'doctor' | 'health-assistant';

const useGetPatientAppointments = (
  patientId: string,
  status?: 'COMPLETED' | 'CONFIRMED' | 'CANCELLED' | 'MISSED',
  enabled: boolean = true,
  page: number = 1,
  limit: number = 10,
  portal: AppointmentsPortal = 'doctor'
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [
      ...APPOINTMENT_QUERY_KEYS.GET_PATIENT_APPOINTMENTS(
        patientId,
        status,
        page,
        limit
      ),
      portal,
    ],
    queryFn: () =>
      portal === 'health-assistant'
        ? getHealthAssistantPatientAppointments(patientId, status, page, limit)
        : getPatientAppointments(patientId, status, page, limit),
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
