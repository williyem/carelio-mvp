'use client';

import EmailVerificationTab from './email-verification-tab';
import { usePatientVerificationStore } from '@/stores/patient-verifcation-store';

interface VerificationTabsProps {
  onEmailSendCode: (email: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

const VerificationTabs = ({
  onEmailSendCode,
  isSubmitting = false,
}: VerificationTabsProps) => {
  const { selectedPatient } = usePatientVerificationStore();
  if (!selectedPatient) return null;
  const { email } = selectedPatient;

  return (
    <div className="flex flex-col gap-5 items-start w-full">
      <EmailVerificationTab
        email={email}
        onSendCode={onEmailSendCode}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default VerificationTabs;
