import { useQuery } from '@tanstack/react-query';
import { getConsultationNoteByAppointment } from '../api-functions';
import { APPOINTMENT_QUERY_KEYS } from '../query-keys';

export const useGetConsultationNoteByAppointment = (
  id: string,
  enabled = true
) => {
  return useQuery({
    queryKey: [APPOINTMENT_QUERY_KEYS.PATIENT_NOTES, id],
    queryFn: () => getConsultationNoteByAppointment(id),
    enabled: !!id && enabled,
  });
};
