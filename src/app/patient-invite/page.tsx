/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Suspense, useEffect, useState } from 'react';

import usePatientInvite from '@/hooks/page-hooks/patient-invite/usePatientInvite';
import LandingStep from '@/components/patient-invite/steps/LandingStep';
import PatientAgreementsStep from '@/components/patient-invite/steps/consent/PatientAgreementsStep';
import OptionalCoverageStep from '@/components/patient-invite/steps/consent/OptionalCoverageStep';
import SuccessStep from '@/components/patient-invite/steps/SuccessStep';
import { InviteLoading } from '@/components/patient-invite/InviteLoading';
import { InviteError } from '@/components/patient-invite/InviteError';
import { getErrorMessage } from '@/integration';
import { toast } from 'sonner';
import {
  InvitationToken,
  VerifyInvitationResponse,
} from '@/integration/auth/patient';
import { useSearchParams } from 'next/navigation';
import { usePatientInviteStore } from '@/stores/patient-invite-store';
import { useVerifyConsent } from '@/integration/auth/patient/queries/use-verify-consent';
import PersonalInfoStep from '@/components/patient-invite/steps/consent/personal-info-step';
import CreatePasswordStep from '@/components/patient-invite/steps/consent/create-password-step';
import { finishInvitePatientRegistration } from '@/lib/patient-onboarding-finish';

function PatientInviteForm({
  onboardingComplete,
  setOnboardingComplete,
  token,
  invitationData,
}: {
  onboardingComplete: boolean;
  setOnboardingComplete: (onboardingComplete: boolean) => void;
  token: string;
  invitationData: VerifyInvitationResponse | null;
}) {
  const { currentStep } = usePatientInvite();
  const { formData, updateFormData, nextStep } = usePatientInviteStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  useEffect(() => {
    if (invitationData && !formData.fullName) {
      updateFormData({
        fullName: invitationData.fullName || undefined,
        address: invitationData.address || undefined,
        bloodType: invitationData.bloodType || undefined,
        dob: invitationData.dob || undefined,
        gender: invitationData.gender || undefined,
        email: invitationData.email || undefined,
        phone: invitationData.phoneNumber || undefined,
        phoneNumber: invitationData.phoneNumber || undefined,
      } as any);
    }
  }, [invitationData, formData.fullName, updateFormData]);

  if (onboardingComplete) {
    return <SuccessStep goToPatient />;
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const latest = usePatientInviteStore.getState().formData;
      await finishInvitePatientRegistration(token, latest as any);
      toast.success('Onboarding completed successfully!');
      setOnboardingComplete(true);
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        'An error occurred during registration. Please try again.'
      );
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePersonalInfo = (data: any) => {
    updateFormData(data);
    nextStep();
  };

  const steps = [
    <LandingStep key="landing" />,
    <PersonalInfoStep
      key="personal-info"
      invitationData={invitationData}
      handlePersonalInfo={handlePersonalInfo}
      isSubmitting={false}
    />,
    <CreatePasswordStep key="create-password" />,
    <PatientAgreementsStep key="agreements" />,
    <OptionalCoverageStep
      key="coverage"
      onFinish={handleSubmit}
      isSubmitting={isSubmitting}
    />,
  ];

  return <div>{steps[currentStep - 1]}</div>;
}

function PatientInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') as InvitationToken;
  const { onboardingComplete, setOnboardingComplete } = usePatientInvite();
  const { isLoading, isError, error, data } = useVerifyConsent(
    token,
    onboardingComplete,
    {
      retry: 1,
      refetchOnWindowFocus: true,
    }
  );

  if (isLoading) {
    return <InviteLoading />;
  }

  if (!token) {
    return (
      <InviteError message="You are not authorized to access this page. Please use the link provided in your invitation email." />
    );
  }
  if (isError) {
    const errorMessage =
      getErrorMessage(error) ||
      'Invalid or expired invite link. Please check the URL or contact the organization.';
    return <InviteError message={errorMessage} />;
  }

  return (
    <>
      <SetTokenInForm token={token || ''} />
      <PatientInviteForm
        onboardingComplete={onboardingComplete}
        setOnboardingComplete={setOnboardingComplete}
        token={token}
        invitationData={data!}
      />
    </>
  );
}

function SetTokenInForm({ token }: { token: string }) {
  const { setInviteToken, inviteToken } = usePatientInvite();

  useEffect(() => {
    if (token && inviteToken !== token) {
      setInviteToken(token);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

export default function PatientInvitePage() {
  return (
    <Suspense fallback={<InviteLoading />}>
      <PatientInviteContent />
    </Suspense>
  );
}
