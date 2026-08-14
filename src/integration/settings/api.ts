import { apiClient } from '../config';
import { extractResponseData } from '../utils';
import type { DoctorAvailability, HourSlot } from '@/stores/availability-store';
import type { StaffProfile } from '@/stores/staff-profile-store';
import type { DoctorBilling, PatientBilling } from '@/stores/billing-store';
import type { InsurancePolicy } from '@/stores/patient-insurance-store';

export interface AvailabilityResponse extends DoctorAvailability {
  timezone: string;
  date?: string;
  slots?: HourSlot[];
}

export interface AccessGrantPerson {
  id: string;
  grantId?: string;
  name: string;
  email: string;
  role: 'doctor' | 'health-assistant';
  granted?: boolean;
}

export async function getDoctorAvailability(
  doctorId: string,
  date?: string
): Promise<AvailabilityResponse> {
  const response = await apiClient.get(`/doctors/${doctorId}/availability`, {
    params: date ? { date } : undefined,
  });
  return extractResponseData(response);
}

export async function getMyAvailability(): Promise<AvailabilityResponse> {
  const response = await apiClient.get('/doctor/availability');
  return extractResponseData(response);
}

export async function saveMyAvailability(
  data: Pick<AvailabilityResponse, 'enabled' | 'days' | 'timezone'>
): Promise<AvailabilityResponse> {
  const response = await apiClient.put('/doctor/availability', data);
  return extractResponseData(response);
}

export async function patchDoctorProfile(
  data: Partial<StaffProfile> & { phoneNumber?: string; avatarUrl?: string }
) {
  const response = await apiClient.patch('/doctor/profile', {
    ...data,
    phoneNumber: data.phoneNumber || data.phone,
  });
  return extractResponseData(response);
}

export async function patchHealthAssistantProfile(
  data: Partial<StaffProfile> & { phoneNumber?: string; avatarUrl?: string }
) {
  const response = await apiClient.patch('/health-assistant/profile', {
    ...data,
    phoneNumber: data.phoneNumber || data.phone,
  });
  return extractResponseData(response);
}

export async function completeStaffOnboarding(
  role: 'doctor' | 'health-assistant',
  data: {
    signedName: string;
    signedAgreementUrl?: string;
  } & Partial<StaffProfile>
) {
  const path =
    role === 'doctor'
      ? '/doctor/onboarding/complete'
      : '/health-assistant/onboarding/complete';
  const response = await apiClient.post(path, {
    ...data,
    phoneNumber: data.phone,
  });
  return extractResponseData(response);
}

export async function getDoctorBilling(): Promise<DoctorBilling> {
  const response = await apiClient.get('/doctor/billing');
  return extractResponseData(response);
}

export async function saveDoctorBilling(
  data: Partial<DoctorBilling>
): Promise<DoctorBilling> {
  const response = await apiClient.patch('/doctor/billing', data);
  return extractResponseData(response);
}

export async function getPatientBilling(): Promise<PatientBilling> {
  const response = await apiClient.get('/patient/billing');
  return extractResponseData(response);
}

export async function getPatientInsurance(): Promise<InsurancePolicy[]> {
  const response = await apiClient.get('/patient/insurance');
  return extractResponseData(response);
}

export async function addPatientInsurance(
  data: Omit<InsurancePolicy, 'id'>
): Promise<InsurancePolicy[]> {
  const response = await apiClient.post('/patient/insurance', data);
  return extractResponseData(response);
}

export async function removePatientInsurance(
  policyId: string
): Promise<InsurancePolicy[]> {
  const response = await apiClient.delete(`/patient/insurance/${policyId}`);
  return extractResponseData(response);
}

export async function getAccessGrants(): Promise<{
  people: AccessGrantPerson[];
  grantedIds: string[];
}> {
  const response = await apiClient.get('/patient/access-grants');
  return extractResponseData(response);
}

export async function grantAccess(data: {
  granteeId: string;
  granteeRole: 'doctor' | 'health-assistant';
}) {
  const response = await apiClient.post('/patient/access-grants', data);
  return extractResponseData(response);
}

export async function revokeAccess(granteeId: string) {
  const response = await apiClient.delete(
    `/patient/access-grants/${granteeId}`
  );
  return extractResponseData(response);
}

export async function patchPatientProfile(data: {
  fullName?: string;
  address?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  bloodType?: string;
  isRegistrationComplete?: boolean;
}) {
  const response = await apiClient.patch('/patient/profile', data);
  return extractResponseData(response);
}

export async function submitAuthenticatedPatientAgreements(data: {
  agreements: {
    type: string;
    signatureUrl: string;
    documentUrl: string;
  }[];
}) {
  const response = await apiClient.post('/patient/agreements', data);
  return extractResponseData(response);
}
