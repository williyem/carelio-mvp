import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocationAccess } from '@/hooks/useLocationAccess';
import Image from 'next/image';
import { Spinner } from '@/components/ui/spinner';
import usePatientInvite from '@/hooks/page-hooks/patient-invite/usePatientInvite';
import landingImage from '@/assets/images/patient-invite/patient-landing.png';
const LandingStep: React.FC = () => {
  const { nextStep } = usePatientInvite();
  const { confirmLocationAccess } = useLocationAccess();
  const [isLoading, setIsLoading] = useState(false);

  const handleLocationConfirmation = async () => {
    try {
      setIsLoading(true);
      const isLocationEnabled = await confirmLocationAccess();
      if (isLocationEnabled) {
        nextStep();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[808px] space-y-5 mx-auto mt-10 p-5 border border-(--border-stroke) ">
      <div>
        <div className="relative w-full h-72">
          <Image
            src={landingImage}
            alt="Patient Invite"
            fill
            className="object-cover object-center w-full h-full rounded-[24px]"
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 text-center">
        <h5 className="text-[32px] font-medium">
          Welcome to Carelio Registration
        </h5>
        <p className="text-[18px] text-(--text-gray-dark)  max-w-[608px]">
          You&apos;re just a few steps away from completing your onboarding.
          This quick process ensures your profile is created and can be accessed
          for your well being.
        </p>

        {/* Location Access Warning */}
        {/* <div className="w-full bg-yellow-50 border border-yellow-200 p-3 rounded-md mb-4 flex items-center">
          <AlertTriangleIcon
            className="text-yellow-800 mr-3 shrink-0"
            size={24}
          />
          <p className="text-yellow-800 text-sm">
            Location access is <strong>mandatory</strong> for compliance and
            security purposes. We use your location to verify the authenticity
            of the registration process and protect your child&apos;s
            information.
          </p>
        </div> */}

        {/* Continue Button */}
        <Button
          variant="brand"
          className="w-full h-[46px] mt-2 text-sm"
          onClick={handleLocationConfirmation}
          disabled={isLoading}
        >
          {isLoading && <Spinner />}
          Let&apos;s Get Started
        </Button>
      </div>
    </div>
  );
};

export default LandingStep;
