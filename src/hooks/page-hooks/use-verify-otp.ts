import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ROUTES } from '@/lib/routes';
import { useForgotPassword, useVerifyOtp } from '@/integration/auth/doctor';
import { getErrorMessage } from '@/integration/utils';

const verifyOtpSchema = z.object({
  otp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

export function useVerifyOtpForm() {
  const [email, setEmail] = React.useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: verifyOtp, isPending: isVerifyOtpPending } = useVerifyOtp();
  const { mutate: forgotPassword, isPending: isForgotPasswordPending } =
    useForgotPassword();

  const form = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    mode: 'onChange',
    defaultValues: {
      otp: '',
    },
  });

  const otp = form.watch('otp', '');

  React.useEffect(() => {
    const emailParam = searchParams.get('email');

    if (!emailParam) {
      toast.error('Session expired. Please request a new code.');
      router.push(ROUTES.AUTH.FORGOT_PASSWORD);
      return;
    }

    try {
      const decodedEmail = decodeURIComponent(emailParam);

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(decodedEmail)) {
        toast.error('Invalid email format. Please request a new code.');
        router.push(ROUTES.AUTH.FORGOT_PASSWORD);
        return;
      }

      setEmail(decodedEmail);
    } catch {
      toast.error('Invalid parameters. Please request a new code.');
      router.push(ROUTES.AUTH.FORGOT_PASSWORD);
    }
  }, [searchParams, router]);

  const onSubmitForm = (data: VerifyOtpFormData) => {
    verifyOtp(
      {
        otp: data.otp,
        email: email as string,
      },
      {
        onSuccess: (response) => {
          toast.success(response.message || 'Verification Successful');
          router.push(ROUTES.AUTH.RESET_PASSWORD);
        },
        onError: (error) => {
          const errorMessage = getErrorMessage(
            error,
            'Invalid code. Please try again.'
          );
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleResend = () => {
    if (!email) {
      toast.error('Email not found. Please request a new code.');
      router.push(ROUTES.AUTH.FORGOT_PASSWORD);
      return;
    }
    forgotPassword(
      { email: email as string },
      {
        onSuccess: () => {
          toast.success('OTP resent to your email');
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, 'Failed to resend OTP'));
        },
      }
    );
  };

  return {
    handleSubmit: form.handleSubmit(onSubmitForm),
    setValue: form.setValue,
    otp,
    formState: form.formState,
    email,
    isPending: isVerifyOtpPending || isForgotPasswordPending,
    handleResend,
  };
}
