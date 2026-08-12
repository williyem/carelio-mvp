'use client';

import { useMemo } from 'react';
import { getFullName, getFirstName } from '@/lib/easy';
import type { DoctorUser } from '@/integration/auth/doctor/types';
import { useDoctorProfile } from '@/integration/doctor/queries/use-doctor-profile';

interface UseUserReturn {
  user: DoctorUser | null;
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
  const { data, isLoading, isFetching, isError } = useDoctorProfile();
  const user = data || null;

  const userId = useMemo(() => {
    return user?.id || '';
  }, [user]);

  const fullName = useMemo(() => {
    return getFullName(user);
  }, [user]);

  const firstName = useMemo(() => {
    return getFirstName(user);
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
