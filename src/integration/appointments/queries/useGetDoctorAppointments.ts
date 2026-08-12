import { useQuery } from '@tanstack/react-query';
import { getDoctorAppointments } from '../api-functions';
import { APPOINTMENT_QUERY_KEYS } from '../query-keys';
import type { GetDoctorAppointmentsParams } from '../types';

export const useGetDoctorAppointments = (
  params?: GetDoctorAppointmentsParams
) => {
  return useQuery({
    queryKey: [APPOINTMENT_QUERY_KEYS.DOCTOR_APPOINTMENTS, params],
    queryFn: () => getDoctorAppointments(params),
  });
};
