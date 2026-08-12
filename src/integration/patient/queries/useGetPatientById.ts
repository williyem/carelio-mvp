import { useQuery } from '@tanstack/react-query';
import { PATIENT_QUERY_KEYS } from '../query-keys';
import { getPatientById } from '../api-function';

const useGetPatientByIdQuery = (id: string) => {
  const queryKey =
    typeof PATIENT_QUERY_KEYS.GET_PATIENT_BY_ID === 'function'
      ? PATIENT_QUERY_KEYS.GET_PATIENT_BY_ID(id)
      : [PATIENT_QUERY_KEYS.PATIENT_BY_ID, id];

  const { data, isLoading, error, isFetching, isError } = useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: () => getPatientById(id),
    enabled: !!id,
  });

  return {
    patient: data,
    data,
    isLoading,
    isFetching,
    isError,
    error,
  };
};

export const useGetPatientById = (id: string, enabled = true) => {
  return useQuery({
    queryKey:
      typeof PATIENT_QUERY_KEYS.GET_PATIENT_BY_ID === 'function'
        ? PATIENT_QUERY_KEYS.GET_PATIENT_BY_ID(id)
        : [PATIENT_QUERY_KEYS.PATIENT_BY_ID, id],
    queryFn: () => getPatientById(id),
    enabled: !!id && enabled,
  });
};

export default useGetPatientByIdQuery;
