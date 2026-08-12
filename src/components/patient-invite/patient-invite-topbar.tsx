'use client';

import { ChevronLeft } from 'lucide-react';
import usePatientInvite from '@/hooks/page-hooks/patient-invite/usePatientInvite';
import LogoSvg from '@/assets/icons/logo-svg';

export default function PatientInviteTopbar() {
  const { currentStep, prevStep, onboardingComplete } = usePatientInvite();

  return (
    <div className="w-full flex justify-between items-center">
      {currentStep > 1 && !onboardingComplete ? (
        <button
          onClick={prevStep}
          className="flex items-center gap-1 typography-label-small text-text-sub-600"
        >
          <ChevronLeft size={18} /> Go Back
        </button>
      ) : (
        <div />
      )}

      <LogoSvg />
      <div />
    </div>
  );
}
