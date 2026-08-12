import { useQuery } from '@tanstack/react-query';
import { getDoctors } from '../api-functions';
import { HEALTH_ASSISTANT_QUERY_KEYS } from '../query-keys';

const useGetDoctors = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: HEALTH_ASSISTANT_QUERY_KEYS.GET_DOCTORS,
    queryFn: () => getDoctors(),
  });

  return {
    data,
    doctors: data?.docs || [],
    isLoading,
    error,
  };
};

export default useGetDoctors;
