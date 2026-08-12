import { useRouter } from 'nextjs-toploader/app';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { API_ENDPOINTS, ROUTES } from '@/lib/routes';
import { useLoginPatient } from '@/integration/auth/patient';
import { getErrorMessage } from '@/integration';
import { PatientId } from '@/integration/auth/patient/types';
import axios from 'axios';

const patientLoginSchema = z.object({
  patientId: z
    .string()
    .min(1, 'Patient ID is required')
    .min(3, 'Patient ID must be at least 3 characters')
    .max(50, 'Patient ID must be less than 50 characters'),
});

export type PatientLoginFormData = z.infer<typeof patientLoginSchema>;

export function usePatientLoginForm() {
  const router = useRouter();
  const { mutate: loginPatient, isPending } = useLoginPatient();

  const form = useForm<PatientLoginFormData>({
    resolver: zodResolver(patientLoginSchema),
    mode: 'onChange',
    defaultValues: {
      patientId: '',
    },
  });

  const onSubmitForm = async (data: PatientLoginFormData) => {
    try {
      await axios.post(API_ENDPOINTS.clearCookies);
    } catch (error) {
      console.error('Failed to clear cookies:', error);
    }

    loginPatient(
      { patientId: data.patientId as PatientId },
      {
        onSuccess: async (response) => {
          try {
            // Cookie-only second call when backend returned tokens but BFF did not set cookies yet
            if (response?.tokenData?.access?.token && response?.user?.id) {
              // Dummy login already set cookies; calling again is idempotent
              await axios.post(
                API_ENDPOINTS.login,
                {
                  accessToken: response.tokenData.access.token,
                  refreshToken: response.tokenData.refresh.token,
                  id: response.user.id,
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );
            }
            toast.success('Login successful');
            router.push(ROUTES.PATIENT.ROOT);
          } catch (error) {
            toast.error('Failed to login. Please try again.');
            console.error('Login error:', error);
          }
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, 'Invalid patient ID'));
        },
      }
    );
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmitForm),
    formState: form.formState,
    isPending,
  };
}
