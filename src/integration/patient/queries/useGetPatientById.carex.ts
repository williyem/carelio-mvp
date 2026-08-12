import { useQuery } from '@tanstack/react-query';
import { PATIENT_QUERY_KEYS } from '../query-keys';
import { getPatientById } from '../api-function';

const useGetPatientByIdQuery = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: PATIENT_QUERY_KEYS.GET_PATIENT_BY_ID(id),
    queryFn: () => getPatientById(id),
    enabled: !!id,
  });

  return {
    patient: data,
    data,
    isLoading,
    error,
  };
};

export default useGetPatientByIdQuery;
