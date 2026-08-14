'use client';

import { usePathname } from 'next/navigation';
import SimpleTopbar from '@/components/dashboard/simple-topbar';
import PatientOnboardingGate from '@/components/onboarding/patient-onboarding-gate';
import { useLogout } from '@/hooks/use-logout';
import { usePatientSession } from '@/integration/auth/patient';
import { ROUTES } from '@/lib/routes';

export default function PatientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const handleLogoutClick = useLogout();
  const { data: session, isLoading } = usePatientSession();
  const user = session?.user;

  if (pathname?.startsWith(ROUTES.PATIENT.APPROVE_DOCTOR)) {
    return <>{children}</>;
  }

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
