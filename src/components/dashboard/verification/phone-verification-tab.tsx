'use client';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import ErrorMessage from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';

interface PhoneVerificationTabProps {
  onSendCode: (phoneNumber: string) => void | Promise<void>;
  phoneNumber: string;
  isSubmitting?: boolean;
}

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine(
      (value) => isValidPhoneNumber(value || ''),
      'Please enter a valid phone number'
    ),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

const PhoneVerificationTab = ({
  onSendCode,
  phoneNumber,
  isSubmitting = false,
}: PhoneVerificationTabProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    mode: 'onChange',
    defaultValues: {
      phone: phoneNumber,
    },
  });

  const onSubmit = async (data: PhoneFormData) => {
    await onSendCode(data.phone);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 items-start w-full"
    >
      <div className="flex flex-col gap-2 items-start w-full">
        <Label
          htmlFor="phone-number"
          className="text-[12px] leading-[16px] text-(--text-muted)"
        >
          Phone Number
        </Label>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <PhoneInput
              defaultCountry="GH"
              value={field.value || ''}
              disabled={true}
              onChange={field.onChange}
              placeholder="+233 24 000 0000"
              className="w-full"
            />
          )}
        />
        <ErrorMessage message={errors.phone?.message} />
        <p className="font-normal leading-[1.2] text-(--text-label) text-[12px]">
          A verification code will be sent via SMS
        </p>
      </div>

      <Button
        type="submit"
        variant="brand"
        disabled={isSubmitting || !!errors.phone || !phoneNumber}
        className="w-full h-[50px] rounded-[8px] px-4 py-4 text-[14px] font-bold leading-[20px]"
      >
        {isSubmitting ? <Spinner /> : 'Send Verification Code'}
      </Button>
    </form>
  );
};

export default PhoneVerificationTab;
