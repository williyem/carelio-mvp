'use client';

import StaffOnboardingGate from '@/components/onboarding/staff-onboarding-gate';
import useUser from '@/hooks/use-user';

export default function HealthAssistantRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, isLoading } = useUser();

  return (
    <>
      <StaffOnboardingGate
        role="health-assistant"
        userId={userId}
        isLoading={isLoading}
      />
      {children}
    </>
  );
}
