'use client';

import StaffOnboardingWizard from '@/components/onboarding/staff-onboarding-wizard';
import OnboardingTopbar from '@/components/onboarding/onboarding-topbar';
import useUser from '@/hooks/use-user';
import { Spinner } from '@/components/ui/spinner';
import { ROUTES } from '@/lib/routes';

export default function HaOnboardingPage() {
  const { user, userId, isLoading } = useUser();

  if (isLoading || !userId) {
    return (
      <div className="min-h-screen mx-auto bg-bg-white-0 max-w-7xl p-4 md:pt-8 pt-0 space-y-8">
        <OnboardingTopbar />
        <div className="flex items-center justify-center pt-24">
          <Spinner />
        </div>
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
