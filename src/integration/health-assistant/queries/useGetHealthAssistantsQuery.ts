import { useQuery } from '@tanstack/react-query';
import { getHealthAssistants } from '../api-functions';
import { HEALTH_ASSISTANT_QUERY_KEYS } from '../query-keys';
import { Clinician } from '@/types/clinician.types';

const useGetHealthAssistantsQuery = () => {
  const { data, isLoading, error } = useQuery<Clinician[]>({
    queryKey: HEALTH_ASSISTANT_QUERY_KEYS.GET_HEALTH_ASSISTANTS,
    queryFn: getHealthAssistants,
  });

  return {
    data,
    isLoading,
    error,
  };
};

export default useGetHealthAssistantsQuery;
