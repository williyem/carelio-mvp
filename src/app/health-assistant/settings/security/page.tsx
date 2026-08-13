'use client';

import SecuritySettings from '@/components/settings/security-settings';
import useUser from '@/hooks/use-user';

export default function HaSecuritySettingsPage() {
  const { user } = useUser();
  return (
    <SecuritySettings
      role="health-assistant"
      twoFactorEnabled={user?.twoFactorEnabled}
    />
  );
}
