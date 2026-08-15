import PatientInviteTopbar from '@/components/patient-invite/patient-invite-topbar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carelio | Staff Invite',
  description: 'Complete your Carelio staff onboarding',
};

export default function StaffInviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen mx-auto bg-bg-white-0 max-w-7xl p-4 md:pt-8 pt-0 space-y-8">
      <PatientInviteTopbar />
      {children}
    </div>
  );
}
