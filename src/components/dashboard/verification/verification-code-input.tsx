'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ErrorMessage from '@/components/ui/error-message';
import PasscodeSvg from '@/assets/icons/passcode-svg';
import { Spinner } from '@/components/ui/spinner';

interface VerificationCodeInputProps {
  contactValue: string;
  method: 'email';
  onVerify: (code: string) => void | Promise<void>;
  onUseDifferentMethod: () => void;
  isSubmitting?: boolean;
}

const verificationCodeSchema = z.object({
  code: z
    .string()
    .min(1, 'Verification code is required')
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d+$/, 'Verification code must contain only numbers'),
});

type VerificationCodeFormData = z.infer<typeof verificationCodeSchema>;

const VerificationCodeInput = ({
  contactValue,
  onVerify,
  onUseDifferentMethod,
  isSubmitting = false,
}: VerificationCodeInputProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationCodeFormData>({
    resolver: zodResolver(verificationCodeSchema),
    mode: 'onChange',
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: VerificationCodeFormData) => {
    await onVerify(data.code);
  };

  return (
    <div className="flex flex-col gap-[36px] items-start w-full">
      <div className="flex flex-col gap-[20px] items-center w-full">
        <div className="flex flex-col gap-[4px] items-center text-center">
          <h2 className="font-bold leading-[1.2] text-(--text-gray) text-[18px] w-[263px]">
            Enter Verification Code
          </h2>
          <div className="font-normal leading-[1.2] text-(--text-gray) text-[14px] w-[263px]">
            <p className="mb-0">
              We sent a verification code to{' '}
              <span className="text-(--brand-blue)">{contactValue}</span>
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-2 items-start w-full"
        >
          <Label
            htmlFor="verification-code"
            className="text-[12px] leading-[16px] text-(--text-muted)"
          >
            Enter 6-digit code
          </Label>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <Input
                id="verification-code"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={field.value}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  field.onChange(value);
                }}
                className="w-full"
                icon={
                  <span className="text-(--text-muted)">
                    <PasscodeSvg />
                  </span>
                }
              />
            )}
          />
          <ErrorMessage message={errors.code?.message} />
        </form>
      </div>

      <div className="flex flex-col gap-3 items-start w-full">
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          variant="brand"
          disabled={isSubmitting || !!errors.code}
          className="w-full h-[50px] rounded-[8px] px-4 py-4 text-[14px] font-bold leading-[20px]"
        >
          {isSubmitting ? <Spinner /> : 'Verify'}
        </Button>
        <button
          type="button"
          onClick={onUseDifferentMethod}
          className="w-full text-center text-(--text-label) text-[14px] font-normal leading-[1.2] underline hover:no-underline transition-all"
        >
          Use a different email
        </button>
      </div>
    </div>
  );
};

export default VerificationCodeInput;
