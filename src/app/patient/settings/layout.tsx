'use client';

import SettingsTabs from '@/components/settings/settings-tabs';
import { ROUTES } from '@/lib/routes';

const TABS = [
  { name: 'Insurance', href: ROUTES.PATIENT.SETTINGS.ROOT },
  { name: 'Billing', href: ROUTES.PATIENT.SETTINGS.BILLING },
  { name: 'Access', href: ROUTES.PATIENT.SETTINGS.ACCESS },
];

export default function PatientSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-[900px] mx-auto">
      <SettingsTabs tabs={TABS} />
      {children}
    </div>
  );
}
