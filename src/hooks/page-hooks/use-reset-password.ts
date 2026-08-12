import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ROUTES } from '@/lib/routes';
import { useResetPassword } from '@/integration/auth/doctor';
import { getErrorMessage } from '@/integration/utils';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Minimum of 8 characters')
      .regex(/[A-Z]/, 'One uppercase character')
      .regex(/[@#$%^&+=]/, 'One special character (@#$%)'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function useResetPasswordForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const router = useRouter();
  const { mutate: resetPassword, isPending } = useResetPassword();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = form.watch('password', '');

  const requirements = [
    { label: 'Minimum of 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase character', valid: /[A-Z]/.test(password) },
    {
      label: 'One special character (@#$%)',
      valid: /[@#$%^&+=]/.test(password),
    },
  ];

  const onSubmitForm = (data: ResetPasswordFormData) => {
    resetPassword(
      {
        password: data.password,
      },
      {
        onSuccess: () => {
          toast.success('Password reset successful!');
          router.push(ROUTES.AUTH.PASSWORD_RESET_SUCCESS);
        },
        onError: (error) => {
          const errorMessage = getErrorMessage(
            error,
            'Failed to reset password. Please try again.'
          );
          toast.error(errorMessage);
        },
      }
    );
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmitForm),
    formState: form.formState,
    password,
    requirements,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isPending,
  };
}
