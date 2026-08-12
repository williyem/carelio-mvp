import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConsentFormWrapper } from './ConsentFormWrapper';
import { usePatientInviteStore } from '@/stores/patient-invite-store';

interface ConsentForm {
  parentGuardianName: string;
  relationship: string;
  agreeToSign: boolean;
  date: string;
}

export default function MinorsConsentStep() {
  const { updateFormData, formData, nextStep } = usePatientInviteStore();

  const { register, handleSubmit, watch } = useForm<ConsentForm>({
    defaultValues: {
      parentGuardianName: formData.parentGuardianName || '',
      relationship: formData.relationship || '',
      agreeToSign: false,
      date: new Date().toLocaleDateString(),
    },
  });

  React.useEffect(() => {
    const subscription = watch((value) => {
      if (
        value.parentGuardianName !== formData.parentGuardianName ||
        value.relationship !== formData.relationship
      ) {
        updateFormData({
          parentGuardianName: value.parentGuardianName,
          relationship: value.relationship,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [
    watch,
    updateFormData,
    formData.parentGuardianName,
    formData.relationship,
  ]);

  const onSubmit = (data: ConsentForm) => {
    updateFormData({
      parentGuardianName: data.parentGuardianName,
      relationship: data.relationship,
      date: data.date,
    });
    nextStep();
  };

  return (
    <ConsentFormWrapper
      title="10. Minors (If Applicable)"
      onNext={handleSubmit(onSubmit)}
      nextDisabled={false}
    >
      <div className="space-y-6 text-left">
        <div className="space-y-4 text-[14px] leading-relaxed text-text-strong-950">
          <p>
            For minors, the parent/guardian provides consent unless limited by
            law. Some services may be confidential for minors under Ohio law.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="parentGuardianName">Parent/Guardian Name</Label>
            <Input
              id="parentGuardianName"
              className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
              {...register('parentGuardianName')}
              placeholder="Full Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Input
              id="relationship"
              className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
              {...register('relationship')}
              placeholder="e.g. Mother, Father"
            />
          </div>
        </div>

        {/* <div className="pt-4 space-y-4 border-t border-gray-100">
          <div className="flex items-start gap-3">
            <Checkbox
              id="minors-agreement"
              className="mt-1"
              checked={agreeToSign}
              onCheckedChange={(val: boolean) => setValue('agreeToSign', val)}
            />
            <SignatureLabel fieldPrefix="minors" />
          </div>
        </div> */}
      </div>
    </ConsentFormWrapper>
  );
}
