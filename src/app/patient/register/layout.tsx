import PatientInviteTopbar from '@/components/patient-invite/patient-invite-topbar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carelio | Patient Invite',
  description: 'Patient invite for Carelio',
};

export default function PatientInviteLayout({
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
