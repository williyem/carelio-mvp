'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface InsurancePolicy {
  id: string;
  provider: string;
  memberId: string;
  groupId: string;
  holderName: string;
  effectiveDate: string;
  expirationDate: string;
  isDefault: boolean;
}

interface InsuranceState {
  byPatientId: Record<string, InsurancePolicy[]>;
  getPolicies: (patientId: string) => InsurancePolicy[];
  addPolicy: (patientId: string, policy: Omit<InsurancePolicy, 'id'>) => void;
  removePolicy: (patientId: string, policyId: string) => void;
}

export const usePatientInsuranceStore = create<InsuranceState>()(
  persist(
    (set, get) => ({
      byPatientId: {},
      getPolicies: (patientId) => get().byPatientId[patientId] ?? [],
      addPolicy: (patientId, policy) =>
        set((state) => {
          const current = state.byPatientId[patientId] ?? [];
          const next = policy.isDefault
            ? current.map((item) => ({ ...item, isDefault: false }))
            : current;
          return {
            byPatientId: {
              ...state.byPatientId,
              [patientId]: [...next, { ...policy, id: `ins-${Date.now()}` }],
            },
          };
        }),
      removePolicy: (patientId, policyId) =>
        set((state) => ({
          byPatientId: {
            ...state.byPatientId,
            [patientId]: (state.byPatientId[patientId] ?? []).filter(
              (item) => item.id !== policyId
            ),
          },
        })),
    }),
    { name: 'carelio.patient-insurance' }
  )
);
