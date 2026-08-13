'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { StaffRole } from '@/stores/staff-profile-store';
import { ROUTES } from '@/lib/routes';

export default function StaffOnboardingGate({
  role,
  userId,
  isLoading,
  completed,
}: {
  role: StaffRole;
  userId: string;
  isLoading: boolean;
  completed?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || !userId) return;
    if (pathname.startsWith('/onboarding')) return;
    if (completed) return;
    router.replace(
      role === 'doctor'
        ? ROUTES.ONBOARDING.DOCTOR
        : ROUTES.ONBOARDING.HEALTH_ASSISTANT
    );
  }, [completed, isLoading, pathname, role, router, userId]);

  return null;
}
