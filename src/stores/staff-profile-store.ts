'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StaffRole = 'doctor' | 'health-assistant';

export interface StaffProfile {
  firstName: string;
  lastName: string;
  title: string;
  specialty: string;
  clinicName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  timezone: string;
  npi: string;
  licenseNumber: string;
  avatarUrl?: string;
}

export const emptyStaffProfile = (): StaffProfile => ({
  firstName: '',
  lastName: '',
  title: '',
  specialty: '',
  clinicName: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  timezone: 'America/New_York',
  npi: '',
  licenseNumber: '',
  avatarUrl: '',
});

function keyFor(role: StaffRole, userId: string) {
  return `${role}:${userId}`;
}

interface StaffProfileState {
  byKey: Record<string, StaffProfile>;
  getProfile: (role: StaffRole, userId: string) => StaffProfile;
  setProfile: (role: StaffRole, userId: string, value: StaffProfile) => void;
}

export const useStaffProfileStore = create<StaffProfileState>()(
  persist(
    (set, get) => ({
      byKey: {},
      getProfile: (role, userId) =>
        get().byKey[keyFor(role, userId)] ?? emptyStaffProfile(),
      setProfile: (role, userId, value) =>
        set((state) => ({
          byKey: { ...state.byKey, [keyFor(role, userId)]: value },
        })),
    }),
    { name: 'carelio.staff-profile' }
  )
);
