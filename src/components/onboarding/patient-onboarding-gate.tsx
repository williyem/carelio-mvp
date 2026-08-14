'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

export function isPatientRegistrationIncomplete(
  user?: {
    isRegistrationComplete?: boolean;
    fullName?: string | null;
    dob?: string | null;
  } | null
): boolean {
  if (!user) return false;
  if (user.isRegistrationComplete === false) return true;
  if (user.isRegistrationComplete === true) return false;
  return !user.fullName || !user.dob;
}

export default function PatientOnboardingGate({
  userId,
  isLoading,
  user,
}: {
  userId?: string;
  isLoading: boolean;
  user?: {
    isRegistrationComplete?: boolean;
    fullName?: string | null;
    dob?: string | null;
  } | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || !userId) return;
    if (pathname?.startsWith(ROUTES.PATIENT.ONBOARDING)) return;
    if (!isPatientRegistrationIncomplete(user)) return;
    router.replace(ROUTES.PATIENT.ONBOARDING);
  }, [isLoading, pathname, router, user, userId]);

  return null;
}
