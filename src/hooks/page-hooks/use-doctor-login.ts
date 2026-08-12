import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { API_ENDPOINTS, ROUTES } from '@/lib/routes';
import { useLoginDoctor } from '@/integration/auth/doctor';
import { getErrorMessage } from '@/integration/utils';
import axios from 'axios';

const doctorLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export type DoctorLoginFormData = z.infer<typeof doctorLoginSchema>;

export function useDoctorLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: loginDoctor, isPending } = useLoginDoctor();

  const form = useForm<DoctorLoginFormData>({
    resolver: zodResolver(doctorLoginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmitForm = async (data: DoctorLoginFormData) => {
    try {
      await axios.post(API_ENDPOINTS.clearCookies);
    } catch (error) {
      console.error('Failed to clear cookies:', error);
    }

    loginDoctor(data, {
      onSuccess: async (response) => {
        if (response.authenticated) {
          router.push(ROUTES.DASHBOARD.ROOT);
          return;
        }

        if (response.requiresPasswordReset) {
          const token = response.resetToken;
          try {
            await axios.post(
              API_ENDPOINTS.doctorLogin,
              { resetToken: token },
              {
                headers: { 'Content-Type': 'application/json' },
              }
            );
            router.push(ROUTES.AUTH.FIRST_TIME_RESET_PASSWORD);
          } catch (error) {
            toast.error('Failed to set session. Please try again.');
            console.error('Login error:', error);
          }
        }
        if (
          ('requires2FA' in response && response.requires2FA) ||
          response?.user?.twoFactorEnabled === true
        ) {
          const token = response.token || response?.tokenData?.access?.token;
          try {
            await axios.post(
              API_ENDPOINTS.doctorLogin,
              { accessToken: token },
              {
                headers: { 'Content-Type': 'application/json' },
              }
            );
            router.push(ROUTES.AUTH.VERIFY_2FA);
          } catch (error) {
            toast.error('Failed to set session. Please try again.');
            console.error('Login error:', error);
          }
          return;
        }

        if (
          ('requiresSetup' in response && response.requiresSetup) ||
          response?.user?.twoFactorEnabled === false
        ) {
          const token =
            response.setupToken || response?.tokenData?.access?.token;
          try {
            await axios.post(
              API_ENDPOINTS.doctorLogin,
              { accessToken: token },
              {
                headers: { 'Content-Type': 'application/json' },
              }
            );
            router.push(ROUTES.AUTH.FIRST_TIME_RESET_PASSWORD);
          } catch (error) {
            toast.error('Failed to set session. Please try again.');
            console.error('Login error:', error);
          }
        }
      },
      onError: (error) => {
        const errorMessage = getErrorMessage(
          error,
          'Invalid email or password'
        );
        toast.error(errorMessage);
      },
    });
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmitForm),
    formState: form.formState,
    showPassword,
    setShowPassword,
    isPending,
  };
}
