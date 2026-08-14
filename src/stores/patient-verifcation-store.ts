import { create } from 'zustand';

export type VerificationPatient = {
  id: string;
  fullName: string;
  email: string;
  linked?: boolean;
};

interface PatientVerificationStore {
  selectedPatient: VerificationPatient | undefined;
  setSelectedPatient: (patient: VerificationPatient) => void;
  verificationCode: string;
  setVerificationCode: (verificationCode: string) => void;
}

export const usePatientVerificationStore = create<PatientVerificationStore>(
  (set) => ({
    selectedPatient: undefined,
    setSelectedPatient: (patient: VerificationPatient) =>
      set({ selectedPatient: patient }),
    verificationCode: '',
    setVerificationCode: (verificationCode: string) =>
      set({ verificationCode }),
  })
);
