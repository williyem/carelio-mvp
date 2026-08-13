'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboarding-store';
import type { StaffRole } from '@/stores/staff-profile-store';
import { ROUTES } from '@/lib/routes';

export default function StaffOnboardingGate({
  role,
  userId,
  isLoading,
}: {
  role: StaffRole;
  userId: string;
  isLoading: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isComplete = useOnboardingStore((s) => s.isComplete);

  useEffect(() => {
    if (isLoading || !userId) return;
    if (pathname.startsWith('/onboarding')) return;
    if (isComplete(role, userId)) return;
    router.replace(
      role === 'doctor'
        ? ROUTES.ONBOARDING.DOCTOR
        : ROUTES.ONBOARDING.HEALTH_ASSISTANT
    );
  }, [isComplete, isLoading, pathname, role, router, userId]);

  return null;
}
