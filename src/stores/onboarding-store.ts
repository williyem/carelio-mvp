'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StaffRole } from './staff-profile-store';

interface OnboardingRecord {
  completed: boolean;
  signedAt?: string;
  signedName?: string;
}

function keyFor(role: StaffRole, userId: string) {
  return `${role}:${userId}`;
}

interface OnboardingState {
  byKey: Record<string, OnboardingRecord>;
  isComplete: (role: StaffRole, userId: string) => boolean;
  complete: (role: StaffRole, userId: string, signedName: string) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      byKey: {},
      isComplete: (role, userId) =>
        Boolean(get().byKey[keyFor(role, userId)]?.completed),
      complete: (role, userId, signedName) =>
        set((state) => ({
          byKey: {
            ...state.byKey,
            [keyFor(role, userId)]: {
              completed: true,
              signedAt: new Date().toISOString(),
              signedName,
            },
          },
        })),
    }),
    { name: 'carelio.onboarding' }
  )
);
