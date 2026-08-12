import { useQuery } from '@tanstack/react-query';
import { searchUnAssignedPatients } from '../api-function';
import { PatientSearchParams } from '../type';
import { PATIENT_QUERY_KEYS } from '../query-keys';

const useGetUnassignedPatientsQuery = (
  params: PatientSearchParams & { enabled?: boolean }
) => {
  const search = params.search || '';
  const page = params.page || 1;
  const limit = params.limit || 10;
  const { data, isLoading, error } = useQuery({
    queryKey: PATIENT_QUERY_KEYS.SEARCH_UNASSIGNED_PATIENTS(search, page, limit),
    queryFn: () => searchUnAssignedPatients({ ...params, search, page, limit }),
    enabled: !!params.enabled,
  });

  return { data, isLoading, error };
};

export default useGetUnassignedPatientsQuery;
