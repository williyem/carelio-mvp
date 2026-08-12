import { useQuery } from '@tanstack/react-query';
import { getHealthAssistantProfile } from '../api-functions';
import { HEALTH_ASSISTANT_QUERY_KEYS } from '../query-keys';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'nextjs-toploader/app';
import { ROUTES } from '@/lib/routes';

export const useHealthAssistantProfile = () => {
  const router = useRouter();

  const query = useQuery({
    queryKey: HEALTH_ASSISTANT_QUERY_KEYS.PROFILE,
    queryFn: () => getHealthAssistantProfile(),
    retry: 1,
  });

  const { isError, error } = query;

  useEffect(() => {
    if (isError) {
      const axiosError = error as { response?: { status: number } };
      if (axiosError?.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        router.push(ROUTES.AUTH.ROOT);
      }
    }
  }, [isError, error, router]);

  return query;
};
