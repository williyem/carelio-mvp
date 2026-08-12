import { useQuery } from '@tanstack/react-query';
import { searchAllPatients } from '../api-function';
import { PatientSearchParams } from '../type';
import { PATIENT_QUERY_KEYS } from '../query-keys';

const useGetAllPatientsQuery = (
  params: PatientSearchParams & { enabled?: boolean }
) => {
  const search = params.search || '';
  const page = params.page || 1;
  const limit = params.limit || 10;
  const { data, isLoading, error } = useQuery({
    queryKey: PATIENT_QUERY_KEYS.SEARCH_ALL_PATIENTS(search, page, limit),
    queryFn: () => searchAllPatients({ ...params, search, page, limit }),
    enabled: params.enabled !== false,
  });

  return { data, isLoading, error };
};

export default useGetAllPatientsQuery;
