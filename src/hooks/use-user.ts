/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo } from 'react';
import { getFullName, getFirstName } from '@/lib/easy';
import type { HealthAssistantProfile } from '@/integration/health-assistant/types';
import { useHealthAssistantProfile } from '@/integration/health-assistant/queries/use-health-assistant-profile';

interface UseUserReturn {
  user: HealthAssistantProfile | null;
  userId: string;
  fullName: string;
  firstName: string;
  email: string;
  phoneNumber: string;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
}

const useUser = (): UseUserReturn => {
  const { data, isLoading, isFetching, isError } = useHealthAssistantProfile();
  const user = data || null;

  const userId = useMemo(() => {
    return user?.id || '';
  }, [user]);

  const fullName = useMemo(() => {
    return getFullName(user as any);
  }, [user]);

  const firstName = useMemo(() => {
    return getFirstName(user as any);
  }, [user]);

  const email = useMemo(() => {
    return user?.email || '';
  }, [user]);

  const phoneNumber = useMemo(() => {
    return user?.phoneNumber || '';
  }, [user]);

  return {
    user,
    userId,
    fullName,
    firstName,
    email,
    phoneNumber,
    isLoading,
    isFetching,
    isError,
  };
};

export default useUser;
