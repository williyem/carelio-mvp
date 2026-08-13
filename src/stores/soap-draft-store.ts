'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SoapDraft {
  appointmentId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  status: 'DRAFT' | 'FINAL';
  updatedAt: string;
}

interface SoapDraftState {
  byAppointmentId: Record<string, SoapDraft>;
  getDraft: (appointmentId: string) => SoapDraft | undefined;
  saveDraft: (
    appointmentId: string,
    notes: Omit<SoapDraft, 'appointmentId' | 'updatedAt'>
  ) => void;
}

export const useSoapDraftStore = create<SoapDraftState>()(
  persist(
    (set, get) => ({
      byAppointmentId: {},
      getDraft: (appointmentId) => get().byAppointmentId[appointmentId],
      saveDraft: (appointmentId, notes) =>
        set((state) => ({
          byAppointmentId: {
            ...state.byAppointmentId,
            [appointmentId]: {
              appointmentId,
              ...notes,
              updatedAt: new Date().toISOString(),
            },
          },
        })),
    }),
    { name: 'carelio.soap-drafts' }
  )
);
