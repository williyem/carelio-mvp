import { useQuery } from '@tanstack/react-query';
import { getPatientById } from '../api-function';
import { PATIENT_QUERY_KEYS } from '../query-keys';

export const useGetPatientById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [PATIENT_QUERY_KEYS.PATIENT_BY_ID, id],
    queryFn: () => getPatientById(id),
    enabled: !!id && enabled,
  });
};
