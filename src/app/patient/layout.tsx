'use client';

import SimpleTopbar from '@/components/dashboard/simple-topbar';
import PatientOnboardingGate from '@/components/onboarding/patient-onboarding-gate';
import { useLogout } from '@/hooks/use-logout';
import { usePatientSession } from '@/integration/auth/patient';

export default function PatientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const handleLogoutClick = useLogout();
  const { data: session, isLoading } = usePatientSession();
  const user = session?.user;

  return (
    <div className="bg-white overflow-clip relative rounded-[40px] w-full min-h-screen">
      <PatientOnboardingGate
        userId={user?.id}
        isLoading={isLoading}
        user={user}
      />
      <SimpleTopbar onLogoutClick={handleLogoutClick} />
      <div className="pt-[40px] pb-[60px] px-4">{children}</div>
    </div>
  );
}
