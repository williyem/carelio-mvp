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
  portal: AppointmentsPortal = 'doctor',
  upcoming?: boolean
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [
      ...APPOINTMENT_QUERY_KEYS.GET_PATIENT_APPOINTMENTS(
        patientId,
        upcoming ? 'UPCOMING' : status,
        page,
        limit
      ),
      portal,
    ],
    queryFn: () =>
      portal === 'health-assistant'
        ? getHealthAssistantPatientAppointments(
            patientId,
            status,
            page,
            limit,
            upcoming
          )
        : getPatientAppointments(patientId, status, page, limit, upcoming),
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
