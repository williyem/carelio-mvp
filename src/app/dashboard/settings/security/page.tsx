'use client';

import SecuritySettings from '@/components/settings/security-settings';
import useUser from '@/hooks/useUser';

export default function DoctorSecuritySettingsPage() {
  const { user } = useUser();
  return (
    <SecuritySettings role="doctor" twoFactorEnabled={user?.twoFactorEnabled} />
  );
}
