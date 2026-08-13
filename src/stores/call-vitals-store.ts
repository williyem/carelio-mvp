'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VitalType } from '@/integration/vitals';

export type CallVitalSource = 'device' | 'manual';
export type CallVitalStatus = 'pending' | 'confirmed' | 'discarded';

export interface CallVital {
  id: string;
  appointmentId: string;
  type: VitalType | string;
  label: string;
  value: string;
  source: CallVitalSource;
  status: CallVitalStatus;
  recordedAt: string;
}

interface CallVitalsState {
  byAppointmentId: Record<string, CallVital[]>;
  getVitals: (appointmentId: string) => CallVital[];
  addVital: (appointmentId: string, vital: Omit<CallVital, 'id'>) => void;
  setStatus: (
    appointmentId: string,
    vitalId: string,
    status: CallVitalStatus
  ) => void;
}

export const useCallVitalsStore = create<CallVitalsState>()(
  persist(
    (set, get) => ({
      byAppointmentId: {},
      getVitals: (appointmentId) => get().byAppointmentId[appointmentId] ?? [],
      addVital: (appointmentId, vital) =>
        set((state) => {
          const current = state.byAppointmentId[appointmentId] ?? [];
          return {
            byAppointmentId: {
              ...state.byAppointmentId,
              [appointmentId]: [
                {
                  ...vital,
                  id: `cv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                },
                ...current,
              ],
            },
          };
        }),
      setStatus: (appointmentId, vitalId, status) =>
        set((state) => ({
          byAppointmentId: {
            ...state.byAppointmentId,
            [appointmentId]: (state.byAppointmentId[appointmentId] ?? []).map(
              (vital) => (vital.id === vitalId ? { ...vital, status } : vital)
            ),
          },
        })),
    }),
    { name: 'carelio.call-vitals' }
  )
);
