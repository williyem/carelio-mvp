'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import {
  fetchAdminDeviceGuides,
  fetchDeviceGuides,
  type DeviceGuideDto,
} from '@/integration/device-guides/api';
import { DEVICE_GUIDES, type DeviceGuide } from '@/lib/device-guides';
import { useDeviceCatalogStore } from '@/stores/device-catalog-store';

export const DEVICE_GUIDES_QUERY_KEY = ['device-guides'] as const;
export const ADMIN_DEVICE_GUIDES_QUERY_KEY = [
  'admin',
  'device-guides',
] as const;

function normalize(guides: DeviceGuideDto[]): DeviceGuide[] {
  return guides.map((guide, index) => ({
    ...guide,
    image: guide.imageUrl || guide.image || '',
    imageUrl: guide.imageUrl || guide.image || '',
    youtubeUrl: guide.youtubeUrl || '',
    sortOrder: guide.sortOrder ?? index + 1,
    isActive: guide.isActive !== false,
  }));
}

/**
 * Active guides for visits. Prefers API; falls back to local store / static seed.
 */
export function useDeviceGuides(options?: { includeInactive?: boolean }) {
  const localGuides = useDeviceCatalogStore((state) => state.guides);
  const replaceGuides = useDeviceCatalogStore((state) => state.replaceGuides);

  const query = useQuery({
    queryKey: DEVICE_GUIDES_QUERY_KEY,
    queryFn: fetchDeviceGuides,
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (query.data && query.data.length > 0) {
      replaceGuides(normalize(query.data));
    }
  }, [query.data, replaceGuides]);

  const data = useMemo(() => {
    const source =
      query.data && query.data.length > 0
        ? normalize(query.data)
        : localGuides.length > 0
          ? localGuides
          : DEVICE_GUIDES;
    const list = options?.includeInactive
      ? [...source]
      : source.filter((guide) => guide.isActive !== false);
    return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [query.data, localGuides, options?.includeInactive]);

  return {
    data,
    isLoading: query.isLoading && data.length === 0,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useAdminDeviceGuides(enabled = true) {
  const replaceGuides = useDeviceCatalogStore((state) => state.replaceGuides);

  const query = useQuery({
    queryKey: ADMIN_DEVICE_GUIDES_QUERY_KEY,
    queryFn: fetchAdminDeviceGuides,
    enabled,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.data && query.data.length > 0) {
      replaceGuides(normalize(query.data));
    }
  }, [query.data, replaceGuides]);

  const data = useMemo(() => {
    if (query.data && query.data.length > 0) {
      return normalize(query.data).sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      );
    }
    return [];
  }, [query.data]);

  return {
    ...query,
    data,
  };
}

export function useDeviceGuide(slug: string | undefined | null) {
  const { data } = useDeviceGuides({ includeInactive: true });
  return useMemo(
    () => (slug ? data.find((guide) => guide.slug === slug) : undefined),
    [data, slug]
  );
}
