/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Suspense, useEffect, useState } from 'react';

import usePatientInvite from '@/hooks/page-hooks/patient-invite/usePatientInvite';
import LandingStep from '@/components/patient-invite/steps/LandingStep';
import TelehealthLocationStep from '@/components/patient-invite/steps/consent/TelehealthLocationStep';
import ConsentToTreatStep from '@/components/patient-invite/steps/consent/ConsentToTreatStep';
import TelehealthConsentStep from '@/components/patient-invite/steps/consent/TelehealthConsentStep';
import SecurityIncidentsStep from '@/components/patient-invite/steps/consent/SecurityIncidentsStep';
import PrivacyPracticesStep from '@/components/patient-invite/steps/consent/PrivacyPracticesStep';
import ReleaseOfInformationStep from '@/components/patient-invite/steps/consent/ReleaseOfInformationStep';
import FinancialResponsibilityStep from '@/components/patient-invite/steps/consent/FinancialResponsibilityStep';
import BehavioralHealthStep from '@/components/patient-invite/steps/consent/BehavioralHealthStep';
import MinorsConsentStep from '@/components/patient-invite/steps/consent/MinorsConsentStep';
import FinalAcknowledgmentStep from '@/components/patient-invite/steps/consent/FinalAcknowledgmentStep';
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
import { uploadFile } from '@/integration/files/api-function';
import usePatientMutations from '@/integration/patient/mutations';
import { useVerifyConsent } from '@/integration/auth/patient/queries/use-verify-consent';
import {
  getPatientPacketMap,
  processPdfOverlay,
  UserData,
} from '@/lib/pdf-overlay';
import PersonalInfoStep from '@/components/patient-invite/steps/consent/personal-info-step';
import { formatPdfDate } from '@/lib/easy';

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
  console.log('🚀 ~ PatientInviteForm ~ invitationData:', invitationData);
  const { currentStep } = usePatientInvite();
  const { formData, updateFormData, nextStep } = usePatientInviteStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { submitConsentAgreementMutation } = usePatientMutations();

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
    return <SuccessStep />;
  }

  const handleSubmit = async () => {
    const userData: UserData = {
      // 1. Personal Information
      fullName: formData.fullName || '',
      dob: formatPdfDate(formData.dateOfBirth),
      date: formData.date || '',
      phone: formData.phoneNumber || '',
      email: formData.email || '',
      emergencyContact: formData.emergencyContact || '',
      primaryCarePhysician: formData.primaryCarePhysician || '',
      emergencyContactPhone: formData.emergencyContactPhone || '',

      // 2. Telehealth Location Verification
      locationForToday: formData.locationForToday || '',
      cityStateZip: formData.cityStateZip || '',
      locationType: formData.locationType || '',
      patientSignature: formData.patientSignature || '',

      // 3-9. Consents & Notices
      patientInitials: formData.patientInitials || '',

      // 8. Financial Responsibility
      insuranceCompany: formData.insuranceCompany || '',
      memberId: formData.memberId || '',
      groupId: formData.groupId || '',
      insurancePhone: formData.insurancePhone || '',
      insuranceCardName: formData.insuranceCardName || '',
      insuranceAddress: formData.insuranceAddress || '',

      // 10. Minors
      parentGuardianName: formData.parentGuardianName || '',
      relationship: formData.relationship || '',

      // 11. Final Acknowledgment
      finalSignatureName: formData.patientSignature || '',
      parentGuardianSignatureName: formData.parentGuardianName || '',
      printedName: formData.fullName || '',
    };

    setIsSubmitting(true);
    try {
      const pdfUrl =
        '/documents/agreements/Full%20Patient%20Packet%20Updated.pdf';
      const fields = getPatientPacketMap(userData as UserData);
      const pdfBytes = await processPdfOverlay(pdfUrl, fields);

      const pdfBlob = new Blob([pdfBytes as unknown as ArrayBuffer], {
        type: 'application/pdf',
      });
      const file = new File(
        [pdfBlob],
        `patient-packet-${formData.fullName || 'signed'}.pdf`,
        {
          type: 'application/pdf',
        }
      );
      const upload = await uploadFile(file);

      // 1. Upload Blank Template (so we have a valid remote URL for documentUrl)
      const pdfResponse = await fetch(pdfUrl);
      const pdfBlobOriginal = await pdfResponse.blob();
      const pdfFileOriginal = new File(
        [pdfBlobOriginal],
        'patient-packet-template.pdf',
        { type: 'application/pdf' }
      );
      const templateUpload = await uploadFile(pdfFileOriginal);

      await submitConsentAgreementMutation.mutateAsync({
        token,
        agreements: [
          {
            type: 'consent',
            signatureUrl: upload.url,
            documentUrl: templateUpload.url,
          },
        ],
      });

      toast.success('Onboarding completed successfully!');
      setOnboardingComplete(true);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage = getErrorMessage(
        error,
        'An error occurred during registration. Please try again.'
      );
      toast.error(errorMessage);
    }
  };

  const handlePersonalInfo = (data: UserData) => {
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
    <TelehealthLocationStep key="location" />,
    <ConsentToTreatStep key="treat" />,
    <TelehealthConsentStep key="telehealth" />,
    <SecurityIncidentsStep key="security" />,
    <PrivacyPracticesStep key="privacy" />,
    <ReleaseOfInformationStep key="roi" />,
    <FinancialResponsibilityStep key="finance" />,
    <BehavioralHealthStep key="behavioral" />,
    <MinorsConsentStep key="minors" />,
    <FinalAcknowledgmentStep
      key="final"
      onFinish={handleSubmit}
      isSubmitting={isSubmitting}
    />,
  ];

  return <div>{steps[currentStep - 1]}</div>;
}

// Main Page Component
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
