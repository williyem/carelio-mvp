'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import usePatientInvite from '@/hooks/page-hooks/patient-invite/usePatientInvite';
import landingImage from '@/assets/images/patient-invite/patient-landing.png';

const LandingStep: React.FC = () => {
  const { nextStep } = usePatientInvite();

  return (
    <div className="w-[900px] mx-auto mt-8 max-w-[90%] rounded-[16px] x-small-shadow border border-(--border-stroke) p-5 space-y-5 bg-bg-white-0">
      <div className="relative w-full h-72">
        <Image
          src={landingImage}
          alt="Carelio patient registration"
          fill
          className="object-cover object-center w-full h-full rounded-[16px]"
        />
      </div>
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-[24px] font-bold">Welcome to Carelio</h2>
        <p className="font-normal text-text-secondary max-w-[608px]">
          Complete a short registration to create your patient profile. You will
          confirm your details, agree to Carelio’s terms, and can optionally add
          NHIS or private coverage.
        </p>
        <Button
          variant="brand"
          className="w-full h-[50px] rounded-[8px] font-bold mt-2"
          onClick={nextStep}
        >
          Let&apos;s Get Started
        </Button>
      </div>
    </div>
  );
};

export default LandingStep;
