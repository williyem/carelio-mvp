import { useQuery } from '@tanstack/react-query';
import { getKnownDevices } from '../api-functions';
import { DEVICE_QUERY_KEYS } from '../query-keys';

const useGetKnownDevices = (enabled: boolean = true) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: DEVICE_QUERY_KEYS.KNOWN_DEVICES(),
    queryFn: getKnownDevices,
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

export default useGetKnownDevices;
