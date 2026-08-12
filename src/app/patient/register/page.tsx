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
  BloodType,
  InvitationToken,
  useCompleteRegistration,
  useVerifyInvitation,
  VerifyInvitationResponse,
} from '@/integration/auth/patient';
import { useSearchParams } from 'next/navigation';
import PersonalInfoStep from '@/components/patient-invite/steps/consent/personal-info-step';
import { formatPdfDate } from '@/lib/easy';
import { usePatientInviteStore } from '@/stores/patient-invite-store';
import { uploadFile } from '@/integration/files/api-function';
import usePatientMutations from '@/integration/patient/mutations';
import {
  getPatientPacketMap,
  processPdfOverlay,
  UserData,
} from '@/lib/pdf-overlay';

function PatientInviteForm({
  onboardingComplete,
  setOnboardingComplete,
  token,
  invitationData,
  isInvite = false,
}: {
  onboardingComplete: boolean;
  setOnboardingComplete: (onboardingComplete: boolean) => void;
  token: string;
  invitationData: VerifyInvitationResponse | null;
  isInvite?: boolean;
}) {
  const { currentStep, nextStep } = usePatientInvite();
  const { formData, updateFormData } = usePatientInviteStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistrationSubmitted, setIsRegistrationSubmitted] = useState(false);

  const { mutateAsync: completeRegistrationMutation } =
    useCompleteRegistration();
  const { submitConsentFormMutation, submitConsentAgreementMutation } =
    usePatientMutations();
  const pdfUrl = '/documents/agreements/Full%20Patient%20Packet%20Updated.pdf';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Pre-populate formData with invitation data
  useEffect(() => {
    if (invitationData && !formData.fullName) {
      updateFormData({
        fullName: '', // VerifyInvitationResponse doesn't have fullName
        email: invitationData.email || undefined,
        phone: invitationData.phoneNumber || undefined,
      });
    }
  }, [invitationData, formData.fullName, updateFormData]);

  if (onboardingComplete) {
    return <SuccessStep />;
  }

  const generateAndUploadPacket = async () => {
    // 1. Upload Blank Template (so we have a valid remote URL for documentUrl)
    const pdfResponse = await fetch(pdfUrl);
    const pdfBlobOriginal = await pdfResponse.blob();
    const pdfFileOriginal = new File(
      [pdfBlobOriginal],
      'patient-packet-template.pdf',
      { type: 'application/pdf' }
    );
    const templateUpload = await uploadFile(pdfFileOriginal);

    // 2. Generate and Upload Signed Packet
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
    const fields = getPatientPacketMap(userData as UserData);
    const pdfBytes = await processPdfOverlay(pdfUrl, fields);
    const pdfBlobSigned = new Blob([pdfBytes as unknown as ArrayBuffer], {
      type: 'application/pdf',
    });
    const pdfFileSigned = new File(
      [pdfBlobSigned],
      `patient-packet-${formData.fullName || 'signed'}.pdf`,
      {
        type: 'application/pdf',
      }
    );
    const signedUpload = await uploadFile(pdfFileSigned);
    return { signatureUrl: signedUpload.url, documentUrl: templateUpload.url };
  };

  const handlePersonalInfo = (data: any) => {
    updateFormData(data);
    nextStep();
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Generate and Upload Packet
      const { signatureUrl, documentUrl } = await generateAndUploadPacket();

      // 2. Complete registration if needed
      if (!isInvite && !isRegistrationSubmitted) {
        const dobString = formatPdfDate(formData.dateOfBirth);
        await completeRegistrationMutation({
          fullName: formData.fullName || '',
          dob: dobString,
          gender: formData.gender as 'male' | 'female' | 'other',
          phoneNumber: formData.phoneNumber || '',
          address: formData.address || '',
          bloodType: (formData.bloodType || '') as unknown as BloodType,
          token: token,
        });
        setIsRegistrationSubmitted(true);
      }

      // 3. Submit consent agreement/form
      if (isInvite) {
        await submitConsentAgreementMutation.mutateAsync({
          token,
          agreements: [
            {
              type: 'consent',
              signatureUrl: signatureUrl,
              documentUrl: documentUrl,
            },
          ],
        });
      } else {
        await submitConsentFormMutation.mutateAsync({
          token,
          agreements: [
            {
              type: 'consent',
              signatureUrl: signatureUrl,
              documentUrl: documentUrl,
            },
          ],
        });
      }

      // Finalize
      toast.success(
        isInvite ? 'Onboarding completed!' : 'Registration successful!'
      );
      setOnboardingComplete(true);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage = getErrorMessage(
        error,
        'An error occurred. Please try again.'
      );
      toast.error(errorMessage);
    }
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
      onFinish={isInvite ? handleFinalSubmit : handleFinalSubmit}
      isSubmitting={isSubmitting}
    />,
  ];

  const currentSteps = isInvite ? steps.slice(0, 12) : steps;

  return <div>{currentSteps[currentStep - 1]}</div>;
}

// Main Page Component
function PatientInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') as InvitationToken;
  const isInvite = searchParams.get('is_invite') === 'true';
  const { onboardingComplete, setOnboardingComplete } = usePatientInvite();
  const { isLoading, isError, error, data } = useVerifyInvitation(
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
        isInvite={isInvite}
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
