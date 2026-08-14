import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ROUTES } from '@/lib/routes';
import {
  useForgotPatientPassword,
  useResetPatientPassword,
} from '@/integration/auth/patient';
import { getErrorMessage } from '@/integration/utils';

const identifierSchema = z.object({
  identifier: z.string().min(1, 'Patient ID or email is required'),
});

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, 'Enter the 6-digit code')
    .max(6)
    .regex(/^\d+$/, 'Code must be numbers'),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type PatientForgotStep = 'identifier' | 'otp' | 'password';

export function usePatientForgotPasswordForm() {
  const router = useRouter();
  const { mutate: requestReset, isPending: isRequestPending } =
    useForgotPatientPassword();
  const { mutate: resetPassword, isPending: isResetPending } =
    useResetPatientPassword();
  const [step, setStep] = useState<PatientForgotStep>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const identifierForm = useForm<z.infer<typeof identifierSchema>>({
    resolver: zodResolver(identifierSchema),
    mode: 'onChange',
    defaultValues: { identifier: '' },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    mode: 'onChange',
    defaultValues: { otp: '' },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmitIdentifier = (data: z.infer<typeof identifierSchema>) => {
    requestReset(
      { identifier: data.identifier },
      {
        onSuccess: () => {
          setIdentifier(data.identifier);
          setStep('otp');
          toast.success(
            'If an account exists, we sent a code to the email on file'
          );
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, 'Could not send reset code'));
        },
      }
    );
  };

  const onSubmitOtp = (data: z.infer<typeof otpSchema>) => {
    setOtp(data.otp);
    setStep('password');
  };

  const onSubmitPassword = (data: z.infer<typeof passwordSchema>) => {
    resetPassword(
      { identifier, otp, password: data.password },
      {
        onSuccess: () => {
          toast.success('Password updated. You can log in now.');
          router.push(ROUTES.AUTH.LOGIN);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, 'Invalid or expired code'));
        },
      }
    );
  };

  return {
    step,
    showPassword,
    setShowPassword,
    isPending: isRequestPending || isResetPending,
    identifierRegister: identifierForm.register,
    handleIdentifierSubmit: identifierForm.handleSubmit(onSubmitIdentifier),
    identifierFormState: identifierForm.formState,
    otpRegister: otpForm.register,
    handleOtpSubmit: otpForm.handleSubmit(onSubmitOtp),
    otpFormState: otpForm.formState,
    passwordRegister: passwordForm.register,
    handlePasswordSubmit: passwordForm.handleSubmit(onSubmitPassword),
    passwordFormState: passwordForm.formState,
  };
}
