import React from 'react';
import { Button } from '@/components/ui/button';
import usePatientInvite from '@/hooks/page-hooks/patient-invite/usePatientInvite';
import { Spinner } from '@/components/ui/spinner';

interface ConsentFormWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onNext?: () => void | Promise<void>;
  isSubmitting?: boolean;
  nextDisabled?: boolean;
  hideNext?: boolean;
}

export const ConsentFormWrapper: React.FC<ConsentFormWrapperProps> = ({
  title,
  description,
  children,
  onNext,
  isSubmitting,
  nextDisabled,
  hideNext,
}) => {
  const { nextStep } = usePatientInvite();

  const handleNext = async () => {
    if (onNext) {
      await onNext();
    } else {
      nextStep();
    }
  };

  return (
    <div className="max-w-[808px] mx-auto mt-10 p-8 border border-(--border-stroke) rounded-[16px] bg-white shadow-none space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-[28px] font-bold text-text-strong-950">{title}</h2>
        {description && (
          <p className="text-[16px] text-(--text-gray-dark) max-w-[608px] mx-auto">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-6">{children}</div>

      <div className="flex gap-4 pt-4">
        {!hideNext && (
          <Button
            variant="brand"
            className="flex-1 h-[48px] rounded-[8px]"
            onClick={handleNext}
            disabled={isSubmitting || nextDisabled}
          >
            {isSubmitting ? <Spinner /> : 'Agree and Continue'}
          </Button>
        )}
      </div>
    </div>
  );
};

export const SignatureLabel: React.FC<{ fieldPrefix: string }> = ({
  fieldPrefix,
}) => (
  <label
    htmlFor={`${fieldPrefix}-agreement`}
    className="typography-paragraph-small text-text-strong-950 leading-normal cursor-pointer block select-none"
  >
    I agree to electronically sign this document using my printed name above
  </label>
);
