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
  nextLabel?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
}

export const ConsentFormWrapper: React.FC<ConsentFormWrapperProps> = ({
  title,
  description,
  children,
  onNext,
  isSubmitting,
  nextDisabled,
  hideNext,
  nextLabel = 'Agree and continue',
  secondaryAction,
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
    <div className="w-[900px] mx-auto mt-8 max-w-[90%] rounded-[16px] x-small-shadow border border-(--border-stroke) p-5 md:p-8 space-y-6 bg-bg-white-0">
      <div className="space-y-2 text-center">
        <h2 className="text-[24px] font-bold text-text-strong-950">{title}</h2>
        {description && (
          <p className="font-normal text-text-secondary max-w-[608px] mx-auto">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-6">{children}</div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {secondaryAction && (
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-[48px] rounded-[8px]"
            onClick={secondaryAction.onClick}
            disabled={isSubmitting || secondaryAction.disabled}
          >
            {secondaryAction.label}
          </Button>
        )}
        {!hideNext && (
          <Button
            variant="brand"
            className="flex-1 h-[48px] rounded-[8px] font-bold"
            onClick={handleNext}
            disabled={isSubmitting || nextDisabled}
          >
            {isSubmitting ? <Spinner /> : nextLabel}
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
