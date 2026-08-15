'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import LandingStep from '@/components/patient-invite/steps/LandingStep';
import PersonalInfoStep from '@/components/patient-invite/steps/consent/personal-info-step';
import PatientAgreementsStep from '@/components/patient-invite/steps/consent/PatientAgreementsStep';
import OptionalCoverageStep from '@/components/patient-invite/steps/consent/OptionalCoverageStep';
import { usePatientInviteStore } from '@/stores/patient-invite-store';
import { usePatientSession } from '@/integration/auth/patient';
import { PATIENT_SESSION_QUERY_KEY } from '@/integration/auth/patient/queries/use-session';
import {
  patchPatientProfile,
  submitAuthenticatedPatientAgreements,
} from '@/integration/settings/api';
import {
  toPatientIsoDob,
  uploadPatientAgreementPdfs,
} from '@/lib/patient-onboarding-finish';
import { getErrorMessage } from '@/integration';
import { ROUTES } from '@/lib/routes';
import { Spinner } from '@/components/ui/spinner';
import type { BloodType, Gender } from '@/integration/auth/patient/types';

export default function PatientOnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isLoading } = usePatientSession();
  const { currentStep, updateFormData, nextStep, goToStep, reset } =
    usePatientInviteStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const user = session?.user;

  useEffect(() => {
    reset();
    goToStep(1);
    setSeeded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user || seeded) return;
    updateFormData({
      fullName: user.fullName || undefined,
      email: user.email || undefined,
      phone: user.phoneNumber || undefined,
      phoneNumber: user.phoneNumber || undefined,
      address: user.address || undefined,
      gender: user.gender || undefined,
      bloodType: user.bloodType || undefined,
      dob: user.dob || undefined,
      dateOfBirth: user.dob || undefined,
    });
    setSeeded(true);
  }, [user, seeded, updateFormData]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (user.isRegistrationComplete === true) {
    router.replace(ROUTES.PATIENT.ROOT);
    return null;
  }

  const handlePersonalInfo = (data: Record<string, unknown>) => {
    updateFormData(data);
    nextStep();
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const latest = usePatientInviteStore.getState().formData;
      const dob =
        toPatientIsoDob(latest.dateOfBirth) ||
        toPatientIsoDob(latest.dob) ||
        '';

      await patchPatientProfile({
        fullName: latest.fullName || latest.printedName || '',
        dob,
        gender: (latest.gender || 'other') as Gender,
        phoneNumber: latest.phoneNumber || latest.phone || '',
        address: latest.address || '',
        bloodType: (latest.bloodType || 'O+') as BloodType,
      });

      const { signatureUrl, documentUrl } =
        await uploadPatientAgreementPdfs(latest);

      await submitAuthenticatedPatientAgreements({
        agreements: [
          {
            type: 'consent',
            signatureUrl,
            documentUrl,
          },
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: PATIENT_SESSION_QUERY_KEY,
      });
      toast.success('Profile completed');
      reset();
      router.replace(ROUTES.PATIENT.ROOT);
    } catch (error) {
      toast.error(
        getErrorMessage(error, 'Could not finish onboarding. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const invitationData = {
    email: user.email,
    phoneNumber: user.phoneNumber,
    fullName: user.fullName,
    dob: user.dob,
    gender: user.gender,
    address: user.address,
    bloodType: user.bloodType,
  };

  const steps = [
    <LandingStep key="landing" />,
    <PersonalInfoStep
      key="personal-info"
      invitationData={invitationData}
      handlePersonalInfo={handlePersonalInfo}
      isSubmitting={false}
    />,
    <PatientAgreementsStep key="agreements" />,
    <OptionalCoverageStep
      key="coverage"
      onFinish={handleFinish}
      isSubmitting={isSubmitting}
    />,
  ];

  return <div>{steps[currentStep - 1] || steps[0]}</div>;
}
