'use client';

import VerificationTabs from './verification-tabs';
import VerificationCodeInput from './verification-code-input';
import MedicalAssistantAssignment from './medical-assistant-assignment';
import { VerificationStepData } from '@/types/verification.types';

interface VerificationStepsProps {
  step: number;
  stepData: VerificationStepData;
  onEmailSendCode: (email: string) => void | Promise<void>;
  onVerifyCode: (code: string) => void | Promise<void>;
  onAssignClinician: (clinicianId: string) => void | Promise<void>;
  onUseDifferentMethod: () => void;
  isSubmitting?: boolean;
}

const VerificationSteps = ({
  step,
  stepData,
  onEmailSendCode,
  onVerifyCode,
  onAssignClinician,
  onUseDifferentMethod,
  isSubmitting = false,
}: VerificationStepsProps) => {
  if (step === 0) {
    return (
      <VerificationTabs
        onEmailSendCode={onEmailSendCode}
        isSubmitting={isSubmitting}
      />
    );
  }

  if (step === 1 && stepData.contactValue) {
    return (
      <VerificationCodeInput
        contactValue={stepData.contactValue}
        method={stepData.method}
        onVerify={onVerifyCode}
        onUseDifferentMethod={onUseDifferentMethod}
        isSubmitting={isSubmitting}
      />
    );
  }

  if (step === 2) {
    return (
      <MedicalAssistantAssignment
        onAssign={onAssignClinician}
        isSubmitting={isSubmitting}
      />
    );
  }

  return null;
};

export default VerificationSteps;
