import { useQuery } from '@tanstack/react-query';
import { getHealthAssistantStats } from '../api-functions';
import { HEALTH_ASSISTANT_QUERY_KEYS } from '../query-keys';

const useGetHealthAssistantStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: HEALTH_ASSISTANT_QUERY_KEYS.GET_STATS,
    queryFn: () => getHealthAssistantStats(),
  });

  return {
    data,
    stats: data,
    isLoading,
    error,
  };
};

export default useGetHealthAssistantStats;
