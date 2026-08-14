import { useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { API_ENDPOINTS, ROUTES } from '@/lib/routes';
import {
  useLoginPatient,
  useVerifyPatientLoginEmail,
} from '@/integration/auth/patient';
import { getErrorMessage } from '@/integration';
import { isPatientRegistrationIncomplete } from '@/components/onboarding/patient-onboarding-gate';
import axios from 'axios';

const patientLoginSchema = z.object({
  identifier: z.string().min(1, 'Patient ID or email is required'),
  password: z.string().min(1, 'Password is required'),
});

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, 'Enter the 6-digit code')
    .max(6)
    .regex(/^\d+$/, 'Code must be numbers'),
});

export type PatientLoginFormData = z.infer<typeof patientLoginSchema>;

function goToPatientHome(
  router: ReturnType<typeof useRouter>,
  user: { isRegistrationComplete?: boolean } | undefined
) {
  router.push(
    isPatientRegistrationIncomplete(user)
      ? ROUTES.PATIENT.ONBOARDING
      : ROUTES.PATIENT.ROOT
  );
}

export function usePatientLoginForm() {
  const router = useRouter();
  const { mutate: loginPatient, isPending: isLoginPending } = useLoginPatient();
  const { mutate: verifyEmail, isPending: isVerifyPending } =
    useVerifyPatientLoginEmail();
  const [showPassword, setShowPassword] = useState(false);
  const [pendingPatientId, setPendingPatientId] = useState<string | null>(null);

  const form = useForm<PatientLoginFormData>({
    resolver: zodResolver(patientLoginSchema),
    mode: 'onChange',
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    mode: 'onChange',
    defaultValues: { otp: '' },
  });

  const onSubmitForm = async (data: PatientLoginFormData) => {
    try {
      await axios.post(API_ENDPOINTS.clearCookies);
    } catch (error) {
      console.error('Failed to clear cookies:', error);
    }

    loginPatient(
      { identifier: data.identifier, password: data.password },
      {
        onSuccess: (response) => {
          if (
            'requiresEmailVerification' in response &&
            response.requiresEmailVerification
          ) {
            setPendingPatientId(response.patientId);
            toast.success('Enter the code sent to your email');
            return;
          }
          toast.success('Login successful');
          goToPatientHome(router, response.user);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, 'Invalid credentials'));
        },
      }
    );
  };

  const onSubmitOtp = (data: z.infer<typeof otpSchema>) => {
    if (!pendingPatientId) return;
    verifyEmail(
      { patientId: pendingPatientId, otp: data.otp },
      {
        onSuccess: (response) => {
          if ('user' in response && response.user) {
            toast.success('Login successful');
            goToPatientHome(router, response.user);
          }
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, 'Invalid or expired code'));
        },
      }
    );
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmitForm),
    formState: form.formState,
    showPassword,
    setShowPassword,
    isPending: isLoginPending || isVerifyPending,
    pendingPatientId,
    otpRegister: otpForm.register,
    handleOtpSubmit: otpForm.handleSubmit(onSubmitOtp),
    otpFormState: otpForm.formState,
  };
}
