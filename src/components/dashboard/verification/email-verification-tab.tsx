'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ErrorMessage from '@/components/ui/error-message';
import EmailInputSvg from '@/assets/icons/email-input-svg';
import { Spinner } from '@/components/ui/spinner';

interface EmailVerificationTabProps {
  email: string;
  onSendCode: (email: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
});

type EmailFormData = z.infer<typeof emailSchema>;

const EmailVerificationTab = ({
  email,
  onSendCode,
  isSubmitting = false,
}: EmailVerificationTabProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: 'onChange',
    defaultValues: {
      email: email || '',
    },
    values: {
      email: email || '',
    },
  });

  const onSubmit = async (data: EmailFormData) => {
    await onSendCode(data.email);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 items-start w-full"
    >
      <div className="flex flex-col gap-2 items-start w-full">
        <Label
          htmlFor="email"
          className="text-[12px] leading-[16px] text-(--text-muted)"
        >
          Email Address
        </Label>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              id="email"
              type="email"
              value={field.value}
              onChange={field.onChange}
              disabled
              className="w-full"
              icon={<EmailInputSvg />}
            />
          )}
        />
        <ErrorMessage message={errors.email?.message} />
        <p className="font-normal leading-[1.2] text-(--text-label) text-[12px]">
          A verification code will be sent via email
        </p>
      </div>

      <Button
        type="submit"
        variant="brand"
        disabled={isSubmitting || !!errors.email || !email}
        className="w-full h-[50px] rounded-[8px] px-4 py-4 text-[14px] font-bold leading-[20px]"
      >
        {isSubmitting ? <Spinner /> : 'Send Verification Code'}
      </Button>
    </form>
  );
};

export default EmailVerificationTab;
