'use client';

import { useRef } from 'react';
import BackButton from '@/components/dashboard/back-button';
import PatientFormContent from '@/components/patient-invite/patient-form-content';
import { ROUTES } from '@/lib/routes';
import { useRouter } from 'nextjs-toploader/app';
import { toast } from 'sonner';
import { getErrorMessage } from '@/integration/utils';
import { AddPatientFormData } from '@/hooks/page-hooks/use-add-patient';
import useHealthAssistantMutations from '@/integration/health-assistant/mutations';
import { format } from 'date-fns';

export default function AddNewPatientPage() {
  const router = useRouter();
  const { registerPatientMutation } = useHealthAssistantMutations();
  const resetFormRef = useRef<(() => void) | null>(null);

  const isPending = registerPatientMutation.isPending;
  const handleBack = () => {
    router.back();
  };

  const handleSubmit = (data: AddPatientFormData) => {
    const dobString = format(data.dateOfBirth, 'yyyy-MM-dd');

    registerPatientMutation.mutate(
      {
        fullName: data.fullName,
        dob: dobString,
        gender: data.gender as 'male' | 'female' | 'other',
        email: data.email || '',
        phoneNumber: data.phoneNumber,
        address: data.address,
        bloodType: data.bloodType || '',
      },
      {
        onSuccess: () => {
          resetFormRef.current?.();
          router.push(ROUTES.HEALTH_ASSISTANT.PATIENT.ROOT);
          toast.success('Patient registered successfully!');
        },
        onError: (error) => {
          const errorMessage = getErrorMessage(
            error,
            'Failed to register patient. Please try again.'
          );
          toast.error(errorMessage);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-5 items-start w-[900px]  max-w-full mx-auto">
      <BackButton onClick={handleBack} />
      <div className="w-full border border-(--border-stroke) p-5  rounded-[20px] flex flex-col gap-6">
        <h1 className="font-bold leading-[1.2] text-(--text-primary) text-[24px] sm:text-[28px]">
          Add New Patient
        </h1>
        <PatientFormContent
          onSubmit={handleSubmit}
          isPending={isPending}
          resetRef={resetFormRef}
        />
      </div>
    </div>
  );
}
