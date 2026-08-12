import { useQuery } from '@tanstack/react-query';
import { getDevices } from '../api-functions';
import { DEVICE_QUERY_KEYS } from '../query-keys';

const useGetDevices = (enabled: boolean = true) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: DEVICE_QUERY_KEYS.DEVICES(),
    queryFn: getDevices,
    enabled,
  });

  return {
    data,
    devices: data || [],
    isLoading,
    error,
    refetch,
  };
};

export default useGetDevices;
