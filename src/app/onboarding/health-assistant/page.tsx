'use client';

import StaffOnboardingWizard from '@/components/onboarding/staff-onboarding-wizard';
import useUser from '@/hooks/use-user';
import { Spinner } from '@/components/ui/spinner';
import { ROUTES } from '@/lib/routes';

export default function HaOnboardingPage() {
  const { user, userId, isLoading } = useUser();

  if (isLoading || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <StaffOnboardingWizard
      role="health-assistant"
      userId={userId}
      homeHref={ROUTES.HEALTH_ASSISTANT.PATIENT.ROOT}
      defaults={{
        firstName: user?.firstName,
        lastName: user?.lastName,
        phone: user?.phone || user?.phoneNumber,
        title: user?.title,
      }}
    />
  );
}
