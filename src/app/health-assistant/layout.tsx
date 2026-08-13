'use client';

import StaffOnboardingGate from '@/components/onboarding/staff-onboarding-gate';
import useUser from '@/hooks/use-user';

export default function HealthAssistantRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, isLoading, user } = useUser();

  return (
    <>
      <StaffOnboardingGate
        role="health-assistant"
        userId={userId}
        isLoading={isLoading}
        completed={user?.onboardingCompleted}
      />
      {children}
    </>
  );
}
