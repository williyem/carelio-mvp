'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AccessRole = 'doctor' | 'health-assistant';

export interface AccessPerson {
  id: string;
  name: string;
  email: string;
  role: AccessRole;
}

export interface AccessGrantState {
  people: AccessPerson[];
  grantedIds: string[];
  seedPeople: (people: AccessPerson[]) => void;
  grant: (id: string) => void;
  revoke: (id: string) => void;
  isGranted: (id: string) => boolean;
}

export const useAccessGrantStore = create<AccessGrantState>()(
  persist(
    (set, get) => ({
      people: [],
      grantedIds: [],
      seedPeople: (people) =>
        set((state) => {
          const merged = [...state.people];
          for (const person of people) {
            if (!merged.some((p) => p.id === person.id)) {
              merged.push(person);
            }
          }
          const grantedIds =
            state.grantedIds.length > 0
              ? state.grantedIds
              : merged.map((p) => p.id);
          return { people: merged, grantedIds };
        }),
      grant: (id) =>
        set((state) => ({
          grantedIds: state.grantedIds.includes(id)
            ? state.grantedIds
            : [...state.grantedIds, id],
        })),
      revoke: (id) =>
        set((state) => ({
          grantedIds: state.grantedIds.filter((value) => value !== id),
        })),
      isGranted: (id) => get().grantedIds.includes(id),
    }),
    { name: 'carelio.access-grants' }
  )
);
