import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { ConsentFormWrapper } from './ConsentFormWrapper';
import { usePatientInviteStore } from '@/stores/patient-invite-store';
import ErrorMessage from '@/components/ui/error-message';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

export const consentFormSchema = z.object({
  insuranceCompany: z.string().min(1, 'Insurance company is required'),
  memberId: z.string().min(1, 'Member ID is required'),
  groupId: z.string().min(1, 'Group number is required'),
  insurancePhone: z
    .string()
    .min(1, 'Insurance phone is required')
    .refine(
      (value) => isValidPhoneNumber(value || ''),
      'Please enter a valid phone number'
    ),
  insuranceCardName: z.string().min(1, 'Name on card is required'),
  insuranceAddress: z.string(),
  agreeToSign: z.boolean(),
  date: z.string(),
});

export type ConsentForm = z.infer<typeof consentFormSchema>;

export default function FinancialResponsibilityStep() {
  const { updateFormData, formData, nextStep } = usePatientInviteStore();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<ConsentForm>({
    resolver: zodResolver(consentFormSchema),
    defaultValues: {
      insuranceCompany: formData.insuranceCompany || '',
      memberId: formData.memberId || '',
      groupId: formData.groupId || '',
      insurancePhone: formData.insurancePhone || '',
      insuranceCardName: formData.insuranceCardName || '',
      insuranceAddress: formData.insuranceAddress || '',
      agreeToSign: true,
      date: new Date().toLocaleDateString(),
    },
  });

  const onSubmit = (data: ConsentForm) => {
    updateFormData({
      insuranceCompany: data.insuranceCompany,
      memberId: data.memberId,
      groupId: data.groupId,
      insurancePhone: data.insurancePhone,
      insuranceCardName: data.insuranceCardName,
      insuranceAddress: data.insuranceAddress,
      date: data.date,
    });
    nextStep();
  };

  return (
    <ConsentFormWrapper
      title="8. Authorization to Charge & Financial Responsibility"
      onNext={handleSubmit(onSubmit)}
      nextDisabled={!isValid}
    >
      <div className="space-y-6 text-left">
        <div className="space-y-4 text-[14px] leading-relaxed text-text-strong-950">
          <p>
            I authorize CAREX to bill my insurance for services provided. I
            understand I am responsible for copays, deductibles, coinsurance,
            and any non-covered services. I agree to provide accurate insurance
            information and notify CAREX of any changes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="insuranceCompany">Insurance Company</Label>
            <Input
              id="insuranceCompany"
              className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
              {...register('insuranceCompany', {
                required: 'Insurance company is required',
              })}
            />
            <ErrorMessage message={errors.insuranceCompany?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insurancePhone">Insurance Phone</Label>
            <Controller
              name="insurancePhone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  defaultCountry="US"
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full"
                  inputClassName="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
                  countryButtonClassName="bg-transparent border-(--border-light) hover:bg-transparent"
                />
              )}
            />
            <ErrorMessage message={errors.insurancePhone?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memberId">Member ID</Label>
            <Input
              id="memberId"
              className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
              {...register('memberId', { required: 'Member ID is required' })}
            />
            <ErrorMessage message={errors.memberId?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="groupId">Group #</Label>
            <Input
              id="groupId"
              className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
              {...register('groupId', { required: 'Group number is required' })}
            />
            <ErrorMessage message={errors.groupId?.message} />
          </div>
          <div className="col-span-full space-y-2">
            <Label htmlFor="insuranceCardName">Name on Insurance Card</Label>
            <Input
              id="insuranceCardName"
              className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
              {...register('insuranceCardName', {
                required: 'Name on card is required',
              })}
            />
            <ErrorMessage message={errors.insuranceCardName?.message} />
          </div>
          <div className="col-span-full space-y-2">
            <Label htmlFor="insuranceAddress">
              Insurance Address (if available)
            </Label>
            <Input
              id="insuranceAddress"
              className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
              {...register('insuranceAddress', {
                required: 'Insurance address is required',
              })}
            />
            <ErrorMessage message={errors.insuranceAddress?.message} />
          </div>
        </div>
      </div>
    </ConsentFormWrapper>
  );
}
