import { useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { API_ENDPOINTS, ROUTES } from '@/lib/routes';
import { useLoginHealthAssistant } from '@/integration/auth/health-assistant';
import { getErrorMessage } from '@/integration/utils';
import axios from 'axios';

const healthAssistantLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export type HealthAssistantLoginFormData = z.infer<
  typeof healthAssistantLoginSchema
>;

export function useHealthAssistantLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: loginHealthAssistant, isPending } = useLoginHealthAssistant();

  const form = useForm<HealthAssistantLoginFormData>({
    resolver: zodResolver(healthAssistantLoginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmitForm = async (data: HealthAssistantLoginFormData) => {
    try {
      await axios.post(API_ENDPOINTS.clearCookies);
    } catch (error) {
      console.error('Failed to clear cookies:', error);
    }

    loginHealthAssistant(data, {
      onSuccess: async (response) => {
        if (response.requiresPasswordReset) {
          const token = response.resetToken;
          try {
            await axios.post(
              API_ENDPOINTS.healthAssistantLogin,
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
          return;
        }

        // 2FA is temporarily disabled. Keep the handlers below for later.
        // if ('requires2FA' in response && response.requires2FA) {
        //   const token = response.token;
        //   try {
        //     await axios.post(
        //       API_ENDPOINTS.healthAssistantLogin,
        //       { accessToken: token },
        //       {
        //         headers: { 'Content-Type': 'application/json' },
        //       }
        //     );
        //     router.push(ROUTES.AUTH.VERIFY_2FA);
        //   } catch (error) {
        //     toast.error('Failed to set session. Please try again.');
        //     console.error('Login error:', error);
        //   }
        //   return;
        // }

        // if ('requiresSetup' in response && response.requiresSetup) {
        //   const token = response.setupToken;
        //   try {
        //     await axios.post(
        //       API_ENDPOINTS.healthAssistantLogin,
        //       { accessToken: token },
        //       {
        //         headers: { 'Content-Type': 'application/json' },
        //       }
        //     );
        //     router.push(ROUTES.AUTH.SETUP_2FA);
        //   } catch (error) {
        //     toast.error('Failed to set session. Please try again.');
        //     console.error('Login error:', error);
        //   }
        //   return;
        // }

        if (
          ('authenticated' in response && response.authenticated) ||
          response.tokenData?.access?.token
        ) {
          try {
            if (response.tokenData?.access?.token) {
              await axios.post(
                API_ENDPOINTS.healthAssistantLogin,
                {
                  accessToken: response.tokenData.access.token,
                  refreshToken: response.tokenData.refresh?.token,
                  user: response.user,
                },
                { headers: { 'Content-Type': 'application/json' } }
              );
            }
          } catch (error) {
            console.error('Cookie sync warning:', error);
          }
          router.push(ROUTES.HEALTH_ASSISTANT.PATIENT.ROOT);
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
