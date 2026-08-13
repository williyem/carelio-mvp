'use client';

import SettingsTabs from '@/components/settings/settings-tabs';
import { ROUTES } from '@/lib/routes';

const TABS = [
  { name: 'Profile', href: ROUTES.DASHBOARD.SETTINGS.ROOT },
  { name: 'Schedule', href: ROUTES.DASHBOARD.SETTINGS.SCHEDULE },
  { name: 'Security', href: ROUTES.DASHBOARD.SETTINGS.SECURITY },
  { name: 'Billing & payouts', href: ROUTES.DASHBOARD.SETTINGS.BILLING },
];

export default function DoctorSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <SettingsTabs tabs={TABS} />
      {children}
    </div>
  );
}
