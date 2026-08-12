import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { PatientInviteFormSchema } from '@/schemas/patient-invite-schema';
import type { PatientInviteFormData } from '@/types/patient-invite.types';
import { usePatientInviteStore } from '@/stores/patient-invite-store';
import { z } from 'zod';

const defaultValues: z.input<typeof PatientInviteFormSchema> = {
  photos: [],
  insuranceCards: {},
  scholarInfo: {},
  parentInfo: {},
  inviteToken: undefined,
  agreements: {},
};

export default function usePatientInvite() {
  const {
    currentStep,
    onboardingComplete,
    inviteToken,
    nextStep,
    prevStep,
    goToStep,
    setOnboardingComplete,
    setInviteToken,
    reset: resetStore,
  } = usePatientInviteStore();

  const form = useForm<PatientInviteFormData>({
    resolver: zodResolver(PatientInviteFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Sync invite token from store to form
  useEffect(() => {
    if (inviteToken) {
      const currentToken = form.getValues('inviteToken');
      if (currentToken !== inviteToken) {
        form.setValue('inviteToken', inviteToken, { shouldValidate: false });
      }
    }
  }, [inviteToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync form token to store when it changes
  const handleSetInviteToken = (token: string) => {
    if (inviteToken !== token) {
      setInviteToken(token);
      form.setValue('inviteToken', token, { shouldValidate: false });
    }
  };

  // Reset both form and store
  const resetFormData = () => {
    form.reset(defaultValues);
    resetStore();
  };

  return {
    // Form methods
    ...form,
    register: form.register,
    handleSubmit: form.handleSubmit,
    control: form.control,
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues,
    formState: form.formState,
    reset: form.reset,

    // Step navigation
    currentStep,
    nextStep,
    prevStep,
    goToStep,

    // State
    onboardingComplete,
    setOnboardingComplete,

    // Token management
    inviteToken,
    setInviteToken: handleSetInviteToken,

    // Reset
    resetFormData,
  };
}
