'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getAppointmentNote } from '../api-functions';
import type { AppointmentNote } from '../types';
import { APPOINTMENT_QUERY_KEYS } from '../query-keys';

/**
 * Hook to get SOAP note for a specific appointment
 */
export const useAppointmentNote = (
  appointmentId: string,
  options?: Omit<
    UseQueryOptions<AppointmentNote | null, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: [APPOINTMENT_QUERY_KEYS.APPOINTMENT_NOTE, appointmentId],
    queryFn: () => getAppointmentNote(appointmentId),
    enabled: !!appointmentId,
    ...options,
  });
};
