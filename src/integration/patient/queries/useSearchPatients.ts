import { useQuery } from '@tanstack/react-query';
import { searchPatients } from '../api-function';
import { PATIENT_QUERY_KEYS } from '../query-keys';
import type { PatientSearchParams } from '../type';

export const useSearchPatients = (
  params?: PatientSearchParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [PATIENT_QUERY_KEYS.SEARCH_PATIENTS, params],
    queryFn: () => searchPatients(params),
    enabled: enabled,
  });
};
