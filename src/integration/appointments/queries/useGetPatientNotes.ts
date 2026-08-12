import { useQuery } from '@tanstack/react-query';
import { getPatientNotes } from '../api-functions';
import { APPOINTMENT_QUERY_KEYS } from '../query-keys';
import type { GetPatientNotesParams } from '../types';

export const useGetPatientNotes = (
  patientId: string,
  params?: GetPatientNotesParams,
  enabled = true
) => {
  return useQuery({
    queryKey: [APPOINTMENT_QUERY_KEYS.PATIENT_NOTES, patientId, params],
    queryFn: () => getPatientNotes(patientId, params),
    enabled: !!patientId && enabled,
  });
};
