'use client';

import StaffOnboardingWizard from '@/components/onboarding/staff-onboarding-wizard';
import useUser from '@/hooks/useUser';
import { Spinner } from '@/components/ui/spinner';
import { ROUTES } from '@/lib/routes';

export default function DoctorOnboardingPage() {
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
      role="doctor"
      userId={userId}
      homeHref={ROUTES.DASHBOARD.ROOT}
      defaults={{
        firstName: user?.firstName,
        lastName: user?.lastName,
        phone: user?.phone || user?.phoneNumber,
        title: user?.title,
        specialty: user?.specialty,
        clinicName: user?.clinicName,
        npi: user?.npi,
        licenseNumber: user?.licenseNumber,
      }}
    />
  );
}
