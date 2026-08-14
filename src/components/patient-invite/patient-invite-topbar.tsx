'use client';

import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import usePatientInvite from '@/hooks/page-hooks/patient-invite/usePatientInvite';

export default function PatientInviteTopbar() {
  const { currentStep, prevStep, onboardingComplete } = usePatientInvite();

  return (
    <div className="w-full flex justify-between items-center">
      {currentStep > 1 && !onboardingComplete ? (
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center gap-1 typography-label-small text-text-sub-600"
        >
          <ChevronLeft size={18} /> Go Back
        </button>
      ) : (
        <div />
      )}

      <Image
        src="/images/carelio-logo.png"
        alt="Carelio"
        width={160}
        height={49}
        className="object-contain"
      />
      <div />
    </div>
  );
}
