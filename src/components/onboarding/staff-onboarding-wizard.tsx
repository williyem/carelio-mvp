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
import { Spinner } from '@/components/ui/spinner';
import { generateSignatureImage } from '@/lib/signatureGenerator';
import { buildProviderAgreementPdf } from '@/lib/provider-agreement-pdf';
import {
  emptyStaffProfile,
  useStaffProfileStore,
  type StaffProfile,
  type StaffRole,
} from '@/stores/staff-profile-store';
import { useOnboardingStore } from '@/stores/onboarding-store';

export default function StaffOnboardingWizard({
  role,
  userId,
  defaults,
  homeHref,
}: {
  role: StaffRole;
  userId: string;
  defaults?: Partial<StaffProfile>;
  homeHref: string;
}) {
  const router = useRouter();
  const getProfile = useStaffProfileStore((s) => s.getProfile);
  const setProfile = useStaffProfileStore((s) => s.setProfile);
  const complete = useOnboardingStore((s) => s.complete);
  const [step, setStep] = useState<1 | 2>(1);
  const [agreed, setAgreed] = useState(false);
  const [signedName, setSignedName] = useState('');
  const [signature, setSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, getValues } = useForm<StaffProfile>({
    defaultValues: { ...emptyStaffProfile(), ...defaults },
  });

  useEffect(() => {
    const stored = getProfile(role, userId);
    reset({ ...emptyStaffProfile(), ...defaults, ...stored });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProfile, reset, role, userId]);

  useEffect(() => {
    if (signedName.trim() && agreed) {
      setSignature(generateSignatureImage(signedName));
    } else {
      setSignature('');
    }
  }, [agreed, signedName]);

  const onProfile = (data: StaffProfile) => {
    setProfile(role, userId, data);
    setSignedName(`${data.firstName} ${data.lastName}`.trim() || signedName);
    setStep(2);
  };

  const onSign = async () => {
    if (!agreed || !signedName.trim()) {
      toast.error('Agree to the documents and type your name to sign');
      return;
    }
    setIsSubmitting(true);
    try {
      const profile = getValues();
      await buildProviderAgreementPdf({
        name: signedName,
        role,
        clinicName: profile.clinicName,
        signatureDataUrl: signature,
      });
      setProfile(role, userId, profile);
      complete(role, userId, signedName);
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        <div className="flex justify-center">
          <Image
            src="/images/carelio-logo.png"
            alt="Carelio"
            width={160}
            height={49}
            className="object-contain"
          />
        </div>
        <div>
          <p className="text-sm text-brand-blue font-medium">
            Step {step} of 2
          </p>
          <h1 className="text-2xl font-bold mt-1">
            {step === 1 ? 'Set up your profile' : 'Review and sign'}
          </h1>
          <p className="text-sm text-(--text-secondary) mt-1">
            {step === 1
              ? 'Tell us about your practice before you start seeing patients.'
              : 'Sign the Business Associate Agreement and telehealth provider terms.'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmit(onProfile)} className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>First name</Label>
                <Input className="h-11" {...register('firstName')} />
              </div>
              <div className="space-y-1.5">
                <Label>Last name</Label>
                <Input className="h-11" {...register('lastName')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input className="h-11" {...register('title')} />
            </div>
            {role === 'doctor' && (
              <>
                <div className="space-y-1.5">
                  <Label>Specialty</Label>
                  <Input className="h-11" {...register('specialty')} />
                </div>
                <div className="space-y-1.5">
                  <Label>Clinic name</Label>
                  <Input className="h-11" {...register('clinicName')} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>NPI</Label>
                    <Input className="h-11" {...register('npi')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>License number</Label>
                    <Input className="h-11" {...register('licenseNumber')} />
                  </div>
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input className="h-11" {...register('phone')} />
            </div>
            <Button
              type="submit"
              variant="brand"
              className="rounded-full h-11 mt-2"
            >
              Continue
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-[20px] border border-(--border-stroke) p-5 text-sm space-y-3 max-h-64 overflow-y-auto">
              <p className="font-semibold">Provider agreement</p>
              <p>
                I agree to Carelio&apos;s Business Associate Agreement,
                telehealth practice standards, and privacy obligations. I
                confirm the information I provided is accurate.
              </p>
              <p>
                I will obtain informed consent before treating patients via
                telehealth and will keep clinical documentation in the chart.
              </p>
            </div>
            <label className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(Boolean(checked))}
              />
              <span>I have read and agree to these documents.</span>
            </label>
            <div className="space-y-1.5">
              <Label>Type your full name to sign</Label>
              <Input
                className="h-11"
                value={signedName}
                onChange={(e) => setSignedName(e.target.value)}
              />
            </div>
            {signature && (
              <div className="border border-dashed border-(--border-stroke) rounded-lg p-3 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={signature} alt="Signature preview" className="h-16" />
              </div>
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-full flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="brand"
                className="rounded-full flex-1"
                onClick={() => void onSign()}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner /> : 'Sign and continue'}
              </Button>
            </div>
            <p className="text-xs text-center text-(--text-secondary)">
              After this you may still be asked to set up 2FA.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
