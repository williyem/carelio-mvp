'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface OnboardingStepCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onNext?: () => void | Promise<void>;
  nextLabel?: string;
  isSubmitting?: boolean;
  nextDisabled?: boolean;
  secondaryAction?: { label: string; onClick: () => void };
}

export const OnboardingStepCard: React.FC<OnboardingStepCardProps> = ({
  title,
  description,
  children,
  onNext,
  nextLabel = 'Agree and Continue',
  isSubmitting,
  nextDisabled,
  secondaryAction,
}) => {
  return (
    <div className="max-w-[808px] mx-auto mt-10 p-8 border border-(--border-stroke) rounded-[16px] bg-(--bg-white) shadow-none space-y-6">
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
        {secondaryAction && (
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-[48px] rounded-[8px]"
            onClick={secondaryAction.onClick}
            disabled={isSubmitting}
          >
            {secondaryAction.label}
          </Button>
        )}
        {onNext && (
          <Button
            type="button"
            variant="brand"
            className="flex-1 h-[48px] rounded-[8px]"
            onClick={() => void onNext()}
            disabled={isSubmitting || nextDisabled}
          >
            {isSubmitting ? <Spinner /> : nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingStepCard;
