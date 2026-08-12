import { useQuery } from '@tanstack/react-query';
import { searchAssignedPatients } from '../api-function';
import { PatientSearchParams, PatientSearchResponse } from '../type';
import { PATIENT_QUERY_KEYS } from '../query-keys';

const useSearchAssignedPatientsQuery = (
  params: PatientSearchParams & { assistantId: string }
) => {
  const search = params.search || '';
  const page = params.page || 1;
  const limit = params.limit || 10;
  const { data, isLoading, error } = useQuery<PatientSearchResponse>({
    queryKey: PATIENT_QUERY_KEYS.SEARCH_ASSIGNED_PATIENTS(
      search,
      page,
      limit,
      params.assistantId
    ),
    queryFn: () =>
      searchAssignedPatients({
        ...params,
        search,
        page,
        limit,
        assistantId: params.assistantId,
      }),
    enabled: !!params.assistantId,
  });

  return { data, isLoading, error };
};

export default useSearchAssignedPatientsQuery;
