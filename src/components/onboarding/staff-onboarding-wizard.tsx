'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import OnboardingTopbar from '@/components/onboarding/onboarding-topbar';
import { OnboardingStepCard } from '@/components/onboarding/onboarding-step-card';
import { generateSignatureImage } from '@/lib/signatureGenerator';
import { buildProviderAgreementPdf } from '@/lib/provider-agreement-pdf';
import { getStaffAgreements } from '@/lib/legal/carelio-agreements';
import {
  emptyStaffProfile,
  type StaffProfile,
  type StaffRole,
} from '@/stores/staff-profile-store';
import {
  completeStaffOnboarding,
  patchDoctorProfile,
  patchHealthAssistantProfile,
} from '@/integration/settings/api';
import { useUploadFile } from '@/integration/files/mutations';
import { getErrorMessage } from '@/integration';
import { useQueryClient } from '@tanstack/react-query';
import { DOCTOR_PROFILE_QUERY_KEY } from '@/integration/doctor/queries/use-doctor-profile';
import { HEALTH_ASSISTANT_QUERY_KEYS } from '@/integration/health-assistant/query-keys';

const LABEL_CLASS =
  'text-[12px] leading-[16px] font-medium text-sm flex items-center gap-2';
const FIELD_CLASS =
  'bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]';

const COMMON_TIMEZONES = [
  'Africa/Accra',
  'Africa/Lagos',
  'Africa/Abidjan',
  'Africa/Lome',
  'UTC',
];

export default function StaffOnboardingWizard({
  role,
  defaults,
  homeHref,
}: {
  role: StaffRole;
  userId: string;
  defaults?: Partial<StaffProfile>;
  homeHref: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const upload = useUploadFile();
  const [step, setStep] = useState<1 | 2>(1);
  const [agreed, setAgreed] = useState(false);
  const [signedName, setSignedName] = useState('');
  const [signature, setSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const agreements = getStaffAgreements(role);

  const { register, handleSubmit, reset, getValues } = useForm<StaffProfile>({
    defaultValues: {
      ...emptyStaffProfile(),
      timezone:
        defaults?.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        'Africa/Accra',
      ...defaults,
    },
  });

  useEffect(() => {
    reset({
      ...emptyStaffProfile(),
      timezone:
        defaults?.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        'Africa/Accra',
      ...defaults,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaults?.firstName, defaults?.lastName, defaults?.phone, reset]);

  useEffect(() => {
    if (signedName.trim() && agreed) {
      setSignature(generateSignatureImage(signedName));
    } else {
      setSignature('');
    }
  }, [agreed, signedName]);

  const onProfile = async (data: StaffProfile) => {
    try {
      if (role === 'doctor') {
        await patchDoctorProfile({ ...data, phoneNumber: data.phone });
      } else {
        await patchHealthAssistantProfile({ ...data, phoneNumber: data.phone });
      }
      setSignedName(`${data.firstName} ${data.lastName}`.trim() || signedName);
      setStep(2);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save profile'));
    }
  };

  const onSign = async () => {
    if (!agreed || !signedName.trim()) {
      toast.error('Agree to the documents and type your name to sign');
      return;
    }
    setIsSubmitting(true);
    try {
      const profile = getValues();
      const blobUrl = await buildProviderAgreementPdf({
        name: signedName,
        role,
        clinicName: profile.clinicName,
        signatureDataUrl: signature,
      });
      const blob = await fetch(blobUrl).then((res) => res.blob());
      const file = new File([blob], 'provider-agreement.pdf', {
        type: 'application/pdf',
      });
      const uploaded = await upload.mutateAsync(file);
      await completeStaffOnboarding(role, {
        ...profile,
        signedName,
        signedAgreementUrl: uploaded.url,
      });
      await queryClient.invalidateQueries({
        queryKey:
          role === 'doctor'
            ? DOCTOR_PROFILE_QUERY_KEY
            : HEALTH_ASSISTANT_QUERY_KEYS.PROFILE,
      });
      toast.success('Onboarding complete');
      router.replace(homeHref);
    } catch (error) {
      console.error(error);
      toast.error('Could not generate the signed agreement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen mx-auto bg-bg-white-0 max-w-7xl p-4 md:pt-8 pt-0 space-y-8">
      <OnboardingTopbar onBack={step === 2 ? () => setStep(1) : undefined} />

      {step === 1 ? (
        <div className="w-[900px] mx-auto mt-8 max-w-[90%] rounded-[16px] x-small-shadow border border-(--border-stroke) p-5">
          <div className="space-y-3 mb-6">
            <h2 className="text-[24px] font-bold">1. Set up your profile</h2>
            <p className="font-normal text-text-secondary">
              {role === 'doctor'
                ? 'Tell us about your practice before you start seeing patients.'
                : 'Tell us how to identify you before you support patients and clinicians.'}
            </p>
          </div>
          <form
            onSubmit={handleSubmit(onProfile)}
            className="flex flex-col gap-6 items-start w-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="flex flex-col gap-2 items-start w-full">
                <Label htmlFor="firstName" className={LABEL_CLASS}>
                  First name
                </Label>
                <Input
                  id="firstName"
                  className={FIELD_CLASS}
                  {...register('firstName', { required: true })}
                />
              </div>
              <div className="flex flex-col gap-2 items-start w-full">
                <Label htmlFor="lastName" className={LABEL_CLASS}>
                  Last name
                </Label>
                <Input
                  id="lastName"
                  className={FIELD_CLASS}
                  {...register('lastName', { required: true })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 items-start w-full">
              <Label htmlFor="title" className={LABEL_CLASS}>
                Professional title
              </Label>
              <Input
                id="title"
                placeholder={
                  role === 'doctor'
                    ? 'e.g. MD, Consultant'
                    : 'e.g. Health Assistant'
                }
                className={FIELD_CLASS}
                {...register('title')}
              />
            </div>
            {role === 'doctor' && (
              <div className="flex flex-col gap-2 items-start w-full">
                <Label htmlFor="specialty" className={LABEL_CLASS}>
                  Specialty
                </Label>
                <Input
                  id="specialty"
                  className={FIELD_CLASS}
                  {...register('specialty')}
                />
              </div>
            )}
            <div className="flex flex-col gap-2 items-start w-full">
              <Label htmlFor="clinicName" className={LABEL_CLASS}>
                {role === 'doctor' ? 'Clinic / practice name' : 'Facility name'}
              </Label>
              <Input
                id="clinicName"
                className={FIELD_CLASS}
                {...register('clinicName')}
              />
            </div>
            {role === 'doctor' && (
              <div className="flex flex-col gap-2 items-start w-full">
                <Label htmlFor="licenseNumber" className={LABEL_CLASS}>
                  Professional licence number
                </Label>
                <Input
                  id="licenseNumber"
                  className={FIELD_CLASS}
                  {...register('licenseNumber')}
                />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="flex flex-col gap-2 items-start w-full">
                <Label htmlFor="phone" className={LABEL_CLASS}>
                  Phone
                </Label>
                <Input
                  id="phone"
                  className={FIELD_CLASS}
                  {...register('phone', { required: true })}
                />
              </div>
              <div className="flex flex-col gap-2 items-start w-full">
                <Label htmlFor="timezone" className={LABEL_CLASS}>
                  Timezone
                </Label>
                <select
                  id="timezone"
                  className={`${FIELD_CLASS} w-full px-3`}
                  {...register('timezone', { required: true })}
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button
              type="submit"
              variant="brand"
              className="w-full h-[50px] rounded-[8px] font-bold mt-2"
            >
              Continue
            </Button>
          </form>
        </div>
      ) : (
        <OnboardingStepCard
          title="2. Review and sign"
          description={
            role === 'doctor'
              ? 'Review Carelio provider terms, then sign electronically.'
              : 'Review Carelio health-assistant terms, then sign electronically.'
          }
          onNext={onSign}
          isSubmitting={isSubmitting}
          nextDisabled={!agreed || !signedName.trim()}
          secondaryAction={{ label: 'Back', onClick: () => setStep(1) }}
        >
          <div className="space-y-6 text-left">
            <div className="max-h-[320px] overflow-y-auto rounded-[8px] border border-(--border-stroke) p-4 space-y-5 text-[14px] leading-relaxed text-text-strong-950">
              {agreements.map((section) => (
                <div key={section.title} className="space-y-2">
                  <p className="font-semibold">{section.title}</p>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                  ))}
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-4 border-t border-(--border-stroke)">
              <div className="space-y-2">
                <Label htmlFor="signedName" className="block">
                  Printed Name:
                </Label>
                <input
                  id="signedName"
                  value={signedName}
                  onChange={(e) => setSignedName(e.target.value)}
                  placeholder="Enter your full name"
                  className="border-0 border-b-2 border-dotted border-(--border-gray) w-full max-w-[300px] outline-none bg-transparent text-base mb-2"
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="provider-agreement"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(Boolean(checked))}
                  className="size-4 mt-0.5"
                />
                <label
                  htmlFor="provider-agreement"
                  className="typography-paragraph-small text-text-strong-950 leading-normal cursor-pointer"
                >
                  I have read and agree to the Carelio terms above, and I
                  electronically sign using my printed name
                </label>
              </div>

              <div>
                <div className="typography-paragraph-medium font-normal mb-1">
                  Signature:
                </div>
                <div className="border-b-2 border-dotted border-(--border-gray) w-full max-w-[300px] h-[60px] relative mb-2 min-w-[200px] flex items-center">
                  {signature ? (
                    <Image
                      src={signature}
                      alt="Generated signature"
                      width={300}
                      height={80}
                      className="w-full h-[60px] object-contain rounded-[4px]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-start text-(--text-muted) text-sm italic">
                      Signature will appear here
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-(--text-secondary)">
              A signed copy of the agreement is stored with your account.
            </p>
          </div>
        </OnboardingStepCard>
      )}
    </div>
  );
}
