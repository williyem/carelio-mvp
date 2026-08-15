'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEVICE_GUIDES, type DeviceGuide } from '@/lib/device-guides';

function seedGuides(): DeviceGuide[] {
  return DEVICE_GUIDES.map((guide, index) => ({
    ...guide,
    imageUrl: guide.imageUrl || guide.image,
    youtubeUrl: guide.youtubeUrl || '',
    sortOrder: guide.sortOrder ?? index + 1,
    isActive: guide.isActive !== false,
  }));
}

interface DeviceCatalogState {
  guides: DeviceGuide[];
  getActiveGuides: () => DeviceGuide[];
  getGuide: (slug: string) => DeviceGuide | undefined;
  upsertGuide: (guide: DeviceGuide) => void;
  setGuideActive: (slug: string, isActive: boolean) => void;
  removeGuide: (slug: string) => void;
  replaceGuides: (guides: DeviceGuide[]) => void;
  resetToSeed: () => void;
}

export const useDeviceCatalogStore = create<DeviceCatalogState>()(
  persist(
    (set, get) => ({
      guides: seedGuides(),
      getActiveGuides: () =>
        get()
          .guides.filter((guide) => guide.isActive !== false)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
      getGuide: (slug) => get().guides.find((guide) => guide.slug === slug),
      upsertGuide: (guide) =>
        set((state) => {
          const exists = state.guides.some((item) => item.slug === guide.slug);
          const nextGuide: DeviceGuide = {
            ...guide,
            image: guide.imageUrl || guide.image,
            imageUrl: guide.imageUrl || guide.image,
          };
          return {
            guides: exists
              ? state.guides.map((item) =>
                  item.slug === guide.slug ? nextGuide : item
                )
              : [...state.guides, nextGuide],
          };
        }),
      setGuideActive: (slug, isActive) =>
        set((state) => ({
          guides: state.guides.map((guide) =>
            guide.slug === slug ? { ...guide, isActive } : guide
          ),
        })),
      removeGuide: (slug) =>
        set((state) => ({
          guides: state.guides.filter((guide) => guide.slug !== slug),
        })),
      replaceGuides: (guides) => set({ guides }),
      resetToSeed: () => set({ guides: seedGuides() }),
    }),
    { name: 'carelio.device-catalog' }
  )
);
