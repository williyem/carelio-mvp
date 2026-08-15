import { apiClient, ApiResponse } from '@/integration/config';
import { extractResponseData } from '@/integration/utils';
import type { StaffRole } from '@/stores/staff-profile-store';

export interface StaffInvitePreview {
  role: StaffRole;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  title?: string;
  specialty?: string;
  clinicName?: string;
  timezone?: string;
  licenseNumber?: string;
}

export interface CompleteStaffInviteRequest {
  token: string;
  role: StaffRole;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  title?: string;
  specialty?: string;
  clinicName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  timezone?: string;
  npi?: string;
  licenseNumber?: string;
  signedName: string;
  signedAgreementUrl?: string;
}

export const verifyStaffInvite = async (
  token: string,
  role: StaffRole
): Promise<StaffInvitePreview> => {
  const response = await apiClient.get<ApiResponse<StaffInvitePreview>>(
    '/auth/staff/verify-invite',
    { params: { token, role } }
  );
  return extractResponseData(response) as StaffInvitePreview;
};

export const completeStaffInvite = async (
  data: CompleteStaffInviteRequest
): Promise<{ message: string; email: string }> => {
  const response = await apiClient.post<
    ApiResponse<{ message: string; email: string }>
  >('/auth/staff/complete-invite', data);
  return extractResponseData(response) as { message: string; email: string };
};
