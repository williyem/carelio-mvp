import { AssignedPatient } from '@/integration/patient/type';
import { create } from 'zustand';

interface PatientVerificationStore {
  selectedPatient: AssignedPatient | undefined;
  setSelectedPatient: (patient: AssignedPatient) => void;
  verificationCode: string;
  setVerificationCode: (verificationCode: string) => void;
}

export const usePatientVerificationStore = create<PatientVerificationStore>(
  (set) => ({
    selectedPatient: undefined,
    setSelectedPatient: (patient: AssignedPatient) =>
      set({ selectedPatient: patient }),
    verificationCode: '',
    setVerificationCode: (verificationCode: string) =>
      set({ verificationCode }),
  })
);
