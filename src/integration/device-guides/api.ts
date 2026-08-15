import { apiClient, ApiResponse } from '@/integration/config';
import { extractResponseData } from '@/integration/utils';
import type { DeviceGuide, DeviceGuideSlug } from '@/lib/device-guides';

export type DeviceGuideDto = DeviceGuide & {
  id?: string;
  isActive?: boolean;
};

export type DeviceGuideWriteBody = Partial<{
  slug: string;
  title: string;
  shortLabel: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  youtubeUrl: string;
  tips: string[];
  steps: string[];
  sortOrder: number;
  isActive: boolean;
}>;

export async function fetchDeviceGuides(): Promise<DeviceGuideDto[]> {
  const response = await apiClient.get<
    ApiResponse<{ guides: DeviceGuideDto[] }> | { guides: DeviceGuideDto[] }
  >('/device-guides');
  const data = extractResponseData(response) as { guides?: DeviceGuideDto[] };
  return data.guides || [];
}

export async function fetchAdminDeviceGuides(): Promise<DeviceGuideDto[]> {
  const response = await apiClient.get<
    ApiResponse<{ guides: DeviceGuideDto[] }> | { guides: DeviceGuideDto[] }
  >('/admin/device-guides');
  const data = extractResponseData(response) as { guides?: DeviceGuideDto[] };
  return data.guides || [];
}

export async function createAdminDeviceGuide(
  body: DeviceGuideWriteBody & {
    slug: string;
    title: string;
    shortLabel: string;
  }
): Promise<DeviceGuideDto> {
  const response = await apiClient.post<
    ApiResponse<{ guide: DeviceGuideDto }> | { guide: DeviceGuideDto }
  >('/admin/device-guides', body);
  const data = extractResponseData(response) as { guide?: DeviceGuideDto };
  if (!data.guide) {
    throw new Error('No guide returned');
  }
  return data.guide;
}

export async function patchAdminDeviceGuide(
  slug: DeviceGuideSlug,
  body: DeviceGuideWriteBody
): Promise<DeviceGuideDto> {
  const response = await apiClient.patch<
    ApiResponse<{ guide: DeviceGuideDto }> | { guide: DeviceGuideDto }
  >(`/admin/device-guides/${slug}`, body);
  const data = extractResponseData(response) as { guide?: DeviceGuideDto };
  if (!data.guide) {
    throw new Error('No guide returned');
  }
  return data.guide;
}

export async function deleteAdminDeviceGuide(
  slug: DeviceGuideSlug
): Promise<void> {
  await apiClient.delete(`/admin/device-guides/${slug}`);
}
