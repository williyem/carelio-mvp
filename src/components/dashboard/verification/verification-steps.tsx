'use client';

import VerificationTabs from './verification-tabs';
import VerificationCodeInput from './verification-code-input';
import { VerificationStepData } from '@/types/verification.types';

interface VerificationStepsProps {
  step: number;
  stepData: VerificationStepData;
  onEmailSendCode: (email: string) => void | Promise<void>;
  onVerifyCode: (code: string) => void | Promise<void>;
  onUseDifferentMethod: () => void;
  isSubmitting?: boolean;
}

const VerificationSteps = ({
  step,
  stepData,
  onEmailSendCode,
  onVerifyCode,
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

  if (step === 1) {
    return (
      <VerificationCodeInput
        contactValue={stepData.contactValue || 'the email on file'}
        method={stepData.method}
        onVerify={onVerifyCode}
        onUseDifferentMethod={onUseDifferentMethod}
        isSubmitting={isSubmitting}
      />
    );
  }

  return null;
};

export default VerificationSteps;
