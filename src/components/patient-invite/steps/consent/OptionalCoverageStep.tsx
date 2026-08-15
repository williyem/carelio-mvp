'use client';

import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { ConsentFormWrapper } from './ConsentFormWrapper';
import { usePatientInviteStore } from '@/stores/patient-invite-store';
import ErrorMessage from '@/components/ui/error-message';
import { isValidPhoneNumber } from 'react-phone-number-input';

type CoverageForm = {
  insuranceCompany: string;
  memberId: string;
  groupId: string;
  insurancePhone: string;
  insuranceCardName: string;
  insuranceAddress: string;
};

export default function OptionalCoverageStep({
  onFinish,
  isSubmitting,
}: {
  onFinish: () => void | Promise<void>;
  isSubmitting?: boolean;
}) {
  const { updateFormData, formData } = usePatientInviteStore();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CoverageForm>({
    defaultValues: {
      insuranceCompany: formData.insuranceCompany || '',
      memberId: formData.memberId || '',
      groupId: formData.groupId || '',
      insurancePhone: formData.insurancePhone || '',
      insuranceCardName: formData.insuranceCardName || '',
      insuranceAddress: formData.insuranceAddress || '',
    },
  });

  const saveAndFinish = async (data: CoverageForm) => {
    updateFormData({
      insuranceCompany: data.insuranceCompany,
      memberId: data.memberId,
      groupId: data.groupId,
      insurancePhone: data.insurancePhone,
      insuranceCardName: data.insuranceCardName,
      insuranceAddress: data.insuranceAddress,
      date: formData.date || new Date().toLocaleDateString('en-CA'),
    });
    await onFinish();
  };

  const skipAndFinish = async () => {
    updateFormData({
      insuranceCompany: '',
      memberId: '',
      groupId: '',
      insurancePhone: '',
      insuranceCardName: '',
      insuranceAddress: '',
      date: formData.date || new Date().toLocaleDateString('en-CA'),
    });
    await onFinish();
  };

  return (
    <ConsentFormWrapper
      title="NHIS / health coverage (optional)"
      description="Add NHIS or a private scheme if you have one. You can skip this and update it later in Settings."
      onNext={handleSubmit(saveAndFinish)}
      isSubmitting={isSubmitting}
      nextLabel="Continue"
      nextDisabled={isSubmitting}
      secondaryAction={{
        label: 'Skip for now',
        onClick: () => void skipAndFinish(),
        disabled: isSubmitting,
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="insuranceCompany">NHIS / health scheme name</Label>
          <Input
            id="insuranceCompany"
            placeholder="e.g. NHIS, or private scheme"
            className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
            {...register('insuranceCompany')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="insurancePhone">Scheme contact phone</Label>
          <Controller
            name="insurancePhone"
            control={control}
            rules={{
              validate: (value) =>
                !value ||
                isValidPhoneNumber(value) ||
                'Please enter a valid phone number',
            }}
            render={({ field }) => (
              <PhoneInput
                defaultCountry="GH"
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="+233 24 000 0000"
                className="w-full"
                inputClassName="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
                countryButtonClassName="bg-transparent border-(--border-light) hover:bg-transparent"
              />
            )}
          />
          <ErrorMessage message={errors.insurancePhone?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="memberId">NHIS / membership number</Label>
          <Input
            id="memberId"
            className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
            {...register('memberId')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="groupId">Employer / group</Label>
          <Input
            id="groupId"
            className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
            {...register('groupId')}
          />
        </div>
        <div className="col-span-full space-y-2">
          <Label htmlFor="insuranceCardName">
            Name on NHIS / membership card
          </Label>
          <Input
            id="insuranceCardName"
            className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
            {...register('insuranceCardName')}
          />
        </div>
        <div className="col-span-full space-y-2">
          <Label htmlFor="insuranceAddress">Scheme address</Label>
          <Input
            id="insuranceAddress"
            className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
            {...register('insuranceAddress')}
          />
        </div>
      </div>
    </ConsentFormWrapper>
  );
}
