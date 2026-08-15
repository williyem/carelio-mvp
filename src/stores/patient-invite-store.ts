import { create } from 'zustand';
import { UserData } from '@/lib/pdf-overlay';

interface PatientInviteStore {
  currentStep: number;
  onboardingComplete: boolean;
  inviteToken?: string;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setOnboardingComplete: (val: boolean) => void;
  setInviteToken: (token: string) => void;
  agreements: Record<string, { pdf: Blob; original?: Blob | string }>;
  formData: Partial<UserData> & {
    dateOfBirth?: string;
    phoneNumber?: string;
    address?: string;
    gender?: string;
    emergencyContactPhone?: string;
    bloodType?: string;
    primaryCarePhysician?: string;
    password?: string;
  };
  setAgreement: (
    key: string,
    data: { pdf: Blob; original?: Blob | string }
  ) => void;
  updateFormData: (data: Partial<PatientInviteStore['formData']>) => void;
  reset: () => void;
}

export const usePatientInviteStore = create<PatientInviteStore>((set) => ({
  currentStep: 1,
  onboardingComplete: false,
  inviteToken: undefined,
  nextStep: () =>
    set((state) => ({
      currentStep: state.currentStep + 1,
    })),
  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(1, state.currentStep - 1),
    })),
  goToStep: (step: number) =>
    set({
      currentStep: step,
    }),
  setOnboardingComplete: (val: boolean) =>
    set({
      onboardingComplete: val,
    }),
  setInviteToken: (token: string) =>
    set({
      inviteToken: token,
    }),
  agreements: {},
  formData: {},
  setAgreement: (key, data) =>
    set((state) => ({
      agreements: { ...state.agreements, [key]: data },
    })),
  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  reset: () =>
    set({
      currentStep: 1,
      onboardingComplete: false,
      inviteToken: undefined,
      agreements: {},
      formData: {},
    }),
}));
