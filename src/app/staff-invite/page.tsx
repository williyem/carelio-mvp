'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PhoneInput } from '@/components/ui/phone-input';
import ErrorMessage from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';
import { InviteLoading } from '@/components/patient-invite/InviteLoading';
import { InviteError } from '@/components/patient-invite/InviteError';
import { OnboardingStepCard } from '@/components/onboarding/onboarding-step-card';
import SuccessStep from '@/components/patient-invite/steps/SuccessStep';
import {
  completeStaffInvite,
  verifyStaffInvite,
  type StaffInvitePreview,
} from '@/integration/auth/staff-invite';
import { getErrorMessage } from '@/integration';
import { getStaffAgreements } from '@/lib/legal/carelio-agreements';
import { generateSignatureImage } from '@/lib/signatureGenerator';
import { buildProviderAgreementPdf } from '@/lib/provider-agreement-pdf';
import { useUploadFile } from '@/integration/files/mutations';
import {
  emptyStaffProfile,
  type StaffProfile,
  type StaffRole,
} from '@/stores/staff-profile-store';

const LABEL_CLASS =
  'text-[12px] leading-[16px] font-medium text-sm flex items-center gap-2';
const FIELD_CLASS =
  'bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]';

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

function parseRole(value: string | null): StaffRole | null {
  if (value === 'doctor' || value === 'health-assistant') return value;
  return null;
}

function StaffInviteWizard({
  token,
  role,
  invite,
}: {
  token: string;
  role: StaffRole;
  invite: StaffInvitePreview;
}) {
  const upload = useUploadFile();
  const [step, setStep] = useState(0);
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [signedName, setSignedName] = useState(
    `${invite.firstName} ${invite.lastName}`.trim()
  );
  const [signature, setSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const agreements = getStaffAgreements(role);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isValid: passwordValid },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, getValues, reset, control } =
    useForm<StaffProfile>({
      defaultValues: {
        ...emptyStaffProfile(),
        firstName: invite.firstName,
        lastName: invite.lastName,
        phone: invite.phoneNumber,
        title: invite.title || '',
        specialty: invite.specialty || '',
        clinicName: invite.clinicName || '',
        timezone:
          invite.timezone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone ||
          'Africa/Accra',
        licenseNumber: invite.licenseNumber || '',
      },
    });

  useEffect(() => {
    reset({
      ...emptyStaffProfile(),
      firstName: invite.firstName,
      lastName: invite.lastName,
      phone: invite.phoneNumber,
      title: invite.title || '',
      specialty: invite.specialty || '',
      clinicName: invite.clinicName || '',
      timezone:
        invite.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        'Africa/Accra',
      licenseNumber: invite.licenseNumber || '',
    });
  }, [invite, reset]);

  useEffect(() => {
    if (signedName.trim() && agreed) {
      setSignature(generateSignatureImage(signedName));
    } else {
      setSignature('');
    }
  }, [agreed, signedName]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const roleLabel = role === 'doctor' ? 'doctor' : 'health assistant';

  const onPassword = (data: PasswordFormData) => {
    setPassword(data.password);
    setStep(2);
  };

  const onProfile = (data: StaffProfile) => {
    setSignedName(`${data.firstName} ${data.lastName}`.trim() || signedName);
    setStep(3);
  };

  const onFinish = async () => {
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
      await completeStaffInvite({
        token,
        role,
        password,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phone,
        title: profile.title,
        specialty: profile.specialty,
        clinicName: profile.clinicName,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zip: profile.zip,
        timezone: profile.timezone,
        npi: profile.npi,
        licenseNumber: profile.licenseNumber,
        signedName,
        signedAgreementUrl: uploaded.url,
      });
      toast.success('Onboarding complete. You can sign in now.');
      setDone(true);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not complete onboarding'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return <SuccessStep />;
  }

  if (step === 0) {
    return (
      <div className="w-[900px] mx-auto mt-8 max-w-[90%] rounded-[16px] x-small-shadow border border-(--border-stroke) p-5 space-y-5 bg-bg-white-0">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-[24px] font-bold">Welcome to Carelio</h2>
          <p className="font-normal text-text-secondary max-w-[608px]">
            You were invited as a <strong>{roleLabel}</strong> ({invite.email}).
            Set a password, confirm your profile, and accept Carelio terms to
            finish.
          </p>
          <Button
            variant="brand"
            className="w-full h-[50px] rounded-[8px] font-bold mt-2"
            onClick={() => setStep(1)}
          >
            Let&apos;s get started
          </Button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="w-[900px] mx-auto mt-8 max-w-[90%] rounded-[16px] x-small-shadow border border-(--border-stroke) p-5">
        <div className="space-y-3 mb-6">
          <h2 className="text-[24px] font-bold">Create a password</h2>
          <p className="font-normal text-text-secondary">
            You will use this password with {invite.email} to sign in.
          </p>
        </div>
        <form
          onSubmit={handlePasswordSubmit(onPassword)}
          className="flex flex-col gap-6 items-start w-full"
        >
          <div className="flex flex-col gap-2 items-start w-full">
            <Label htmlFor="password" className={LABEL_CLASS}>
              Password
            </Label>
            <div className="relative w-full">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                className={`${FIELD_CLASS} pr-10`}
                {...registerPassword('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted)"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <ErrorMessage message={passwordErrors.password?.message} />
          </div>
          <div className="flex flex-col gap-2 items-start w-full">
            <Label htmlFor="confirmPassword" className={LABEL_CLASS}>
              Confirm password
            </Label>
            <div className="relative w-full">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`${FIELD_CLASS} pr-10`}
                {...registerPassword('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted)"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <ErrorMessage message={passwordErrors.confirmPassword?.message} />
          </div>
          <Button
            type="submit"
            variant="brand"
            disabled={!passwordValid}
            className="w-full h-[50px] rounded-[8px] font-bold"
          >
            Continue
          </Button>
        </form>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="w-[900px] mx-auto mt-8 max-w-[90%] rounded-[16px] x-small-shadow border border-(--border-stroke) p-5">
        <div className="space-y-3 mb-6">
          <h2 className="text-[24px] font-bold">Confirm your profile</h2>
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
          {role === 'doctor' ? (
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
          ) : null}
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
          {role === 'doctor' ? (
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
          ) : null}
          <div className="flex flex-col gap-2 items-start w-full">
            <Label htmlFor="phone" className={LABEL_CLASS}>
              Phone
            </Label>
            <Controller
              name="phone"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <PhoneInput
                  defaultCountry="GH"
                  value={field.value || ''}
                  onChange={(value) => field.onChange(value || '')}
                  placeholder="+233 24 000 0000"
                  className="w-full"
                  inputClassName={FIELD_CLASS}
                  countryButtonClassName="bg-transparent border-(--border-light) hover:bg-transparent"
                />
              )}
            />
          </div>
          <div className="flex w-full gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-[50px] rounded-[8px]"
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="brand"
              className="flex-1 h-[50px] rounded-[8px] font-bold"
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <OnboardingStepCard
      title="Review and sign"
      description={
        role === 'doctor'
          ? 'Review Carelio provider terms, then sign electronically.'
          : 'Review Carelio health-assistant terms, then sign electronically.'
      }
      onNext={onFinish}
      isSubmitting={isSubmitting}
      nextDisabled={!agreed || !signedName.trim()}
      secondaryAction={{ label: 'Back', onClick: () => setStep(2) }}
    >
      <div className="space-y-6 text-left">
        <div className="max-h-[320px] overflow-y-auto rounded-[8px] border border-gray-100 p-4 space-y-5 text-[14px] leading-relaxed text-text-strong-950">
          {agreements.map((section) => (
            <div key={section.title} className="space-y-2">
              <p className="font-semibold">{section.title}</p>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          ))}
        </div>
        <div className="pt-4 space-y-4 border-t border-gray-100">
          <div className="space-y-2">
            <Label htmlFor="signedName" className="block">
              Printed Name:
            </Label>
            <input
              id="signedName"
              value={signedName}
              onChange={(e) => setSignedName(e.target.value)}
              placeholder="Enter your full name"
              className="border-0 border-b-2 border-dotted border-gray-400 w-full max-w-[300px] outline-none bg-transparent text-base mb-2"
            />
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="staff-agreement"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(Boolean(checked))}
              className="size-4 mt-0.5"
            />
            <label
              htmlFor="staff-agreement"
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
            <div className="border-b-2 border-dotted border-gray-400 w-full max-w-[300px] h-[60px] relative mb-2 min-w-[200px] flex items-center">
              {signature ? (
                <Image
                  src={signature}
                  alt="Generated signature"
                  width={300}
                  height={80}
                  className="w-full h-[60px] object-contain rounded-[4px]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-start text-gray-400 text-sm italic">
                  Signature will appear here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </OnboardingStepCard>
  );
}

function StaffInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const role = useMemo(
    () => parseRole(searchParams.get('role')),
    [searchParams]
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['staff-invite', token, role],
    queryFn: () => verifyStaffInvite(token, role!),
    enabled: Boolean(token && role),
    retry: false,
  });

  if (!token || !role) {
    return (
      <InviteError message="This invite link is missing a token or role. Please use the link from your email." />
    );
  }

  if (isLoading) {
    return <InviteLoading />;
  }

  if (isError || !data) {
    return (
      <InviteError
        message={getErrorMessage(
          error,
          'This invite link is invalid or has expired.'
        )}
      />
    );
  }

  return <StaffInviteWizard token={token} role={role} invite={data} />;
}

export default function StaffInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      }
    >
      <StaffInviteContent />
    </Suspense>
  );
}
