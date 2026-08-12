import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ROUTES } from '@/lib/routes';
import { useForgotPassword } from '@/integration/auth/doctor';
import { getErrorMessage } from '@/integration/utils';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function useForgotPasswordForm() {
  const router = useRouter();
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const onSubmitForm = (data: ForgotPasswordFormData) => {
    forgotPassword(data, {
      onSuccess: () => {
        toast.success('Password reset link sent to your email');
        const encodedEmail = encodeURIComponent(data.email);
        router.push(`${ROUTES.AUTH.VERIFY_OTP}?email=${encodedEmail}`);
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, 'Email not found in our records'));
      },
    });
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmitForm),
    formState: form.formState,
    isPending,
  };
}
