'use client';

import { useState } from 'react';
import HealthAssistantTopbar from '@/components/dashboard/health-assistant-topbar';
import DeviceConfigurationSheet from '@/components/dashboard/device-configuration-sheet';
import { useLogout } from '@/hooks/use-logout';

export default function PatientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDeviceSheetOpen, setIsDeviceSheetOpen] = useState(false);
  const handleLogoutClick = useLogout();

  const handleDevicesClick = () => {
    setIsDeviceSheetOpen(true);
  };

  return (
    <div className="bg-(--bg-white) overflow-clip relative rounded-[40px] w-full min-h-screen">
      <HealthAssistantTopbar
        onDevicesClick={handleDevicesClick}
        onLogoutClick={handleLogoutClick}
      />
      <div className="pt-[40px] pb-[60px] px-4">{children}</div>
      <DeviceConfigurationSheet
        open={isDeviceSheetOpen}
        onOpenChange={setIsDeviceSheetOpen}
      />
    </div>
  );
}
