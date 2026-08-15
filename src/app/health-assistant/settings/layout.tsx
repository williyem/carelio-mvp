'use client';

import { useState } from 'react';
import HealthAssistantTopbar from '@/components/dashboard/health-assistant-topbar';
import DeviceConfigurationSheet from '@/components/dashboard/device-configuration-sheet';
import { useLogout } from '@/hooks/use-logout';
import SettingsTabs from '@/components/settings/settings-tabs';
import { ROUTES } from '@/lib/routes';

const TABS = [
  { name: 'Profile', href: ROUTES.HEALTH_ASSISTANT.SETTINGS.ROOT },
  { name: 'Security', href: ROUTES.HEALTH_ASSISTANT.SETTINGS.SECURITY },
];

export default function HealthAssistantSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDeviceSheetOpen, setIsDeviceSheetOpen] = useState(false);
  const handleLogoutClick = useLogout();

  return (
    <div className="bg-(--bg-white) relative w-full min-h-screen">
      <HealthAssistantTopbar
        onDevicesClick={() => setIsDeviceSheetOpen(true)}
        onLogoutClick={handleLogoutClick}
      />
      <div className="pt-10 pb-[60px] px-4 max-w-5xl mx-auto">
        <SettingsTabs tabs={TABS} />
        {children}
      </div>
      <DeviceConfigurationSheet
        open={isDeviceSheetOpen}
        onOpenChange={setIsDeviceSheetOpen}
      />
    </div>
  );
}
