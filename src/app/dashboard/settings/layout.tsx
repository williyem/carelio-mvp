'use client';

import SettingsTabs from '@/components/settings/settings-tabs';
import useUser from '@/hooks/useUser';
import { ROUTES } from '@/lib/routes';

const BASE_TABS = [
  { name: 'Profile', href: ROUTES.DASHBOARD.SETTINGS.ROOT },
  { name: 'Schedule', href: ROUTES.DASHBOARD.SETTINGS.SCHEDULE },
  { name: 'Security', href: ROUTES.DASHBOARD.SETTINGS.SECURITY },
  { name: 'Billing & payouts', href: ROUTES.DASHBOARD.SETTINGS.BILLING },
];

const TEAM_TAB = { name: 'Team', href: ROUTES.DASHBOARD.SETTINGS.TEAM };
const DEVICES_TAB = {
  name: 'Devices',
  href: ROUTES.DASHBOARD.SETTINGS.DEVICES,
};

export default function DoctorSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const tabs = user?.isAdmin
    ? [...BASE_TABS, TEAM_TAB, DEVICES_TAB]
    : BASE_TABS;

  return (
    <div>
      <SettingsTabs tabs={tabs} />
      {children}
    </div>
  );
}
