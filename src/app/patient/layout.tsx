'use client';

import SimpleTopbar from '@/components/dashboard/simple-topbar';
import { useLogout } from '@/hooks/use-logout';

export default function HealthAssistantLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const handleLogoutClick = useLogout();

  return (
    <div className="bg-white overflow-clip relative rounded-[40px] w-full min-h-screen">
      <SimpleTopbar onLogoutClick={handleLogoutClick} />
      <div className="pt-[40px] pb-[60px] px-4">{children}</div>
    </div>
  );
}
