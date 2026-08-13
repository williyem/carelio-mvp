'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PatientVitalEntry {
  id: string;
  patientId: string;
  recordedAt: string;
  systolic: string;
  diastolic: string;
  heartRate: string;
  temperature: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  notes?: string;
  status: 'pending' | 'confirmed';
  source: 'patient-manual';
}

interface PatientVitalsState {
  entries: PatientVitalEntry[];
  addEntry: (
    entry: Omit<PatientVitalEntry, 'id' | 'status' | 'source'>
  ) => void;
  getForPatient: (patientId: string) => PatientVitalEntry[];
}

export const usePatientVitalsStore = create<PatientVitalsState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({
          entries: [
            {
              ...entry,
              id: `pv-${Date.now()}`,
              status: 'pending',
              source: 'patient-manual',
            },
            ...state.entries,
          ],
        })),
      getForPatient: (patientId) =>
        get().entries.filter((entry) => entry.patientId === patientId),
    }),
    { name: 'carelio.patient-vitals' }
  )
);
