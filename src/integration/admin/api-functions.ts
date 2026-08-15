import { apiClient } from '@/integration/config';
import { ADMIN_ENDPOINTS } from './endpoints';
import type {
  AdminDoctor,
  AdminHealthAssistant,
  AdminPatient,
  CreateStaffRequest,
  SetActiveRequest,
} from './types';

export async function listAdminDoctors(): Promise<AdminDoctor[]> {
  const response = await apiClient.get<{ doctors: AdminDoctor[] }>(
    ADMIN_ENDPOINTS.DOCTORS
  );
  return response.data.doctors;
}

export async function createAdminDoctor(
  data: CreateStaffRequest
): Promise<AdminDoctor> {
  const response = await apiClient.post<{ doctor: AdminDoctor }>(
    ADMIN_ENDPOINTS.DOCTORS,
    data
  );
  return response.data.doctor;
}

export async function setAdminDoctorActive(
  id: string,
  data: SetActiveRequest
): Promise<AdminDoctor> {
  const response = await apiClient.patch<{ doctor: AdminDoctor }>(
    ADMIN_ENDPOINTS.DOCTOR_ACTIVE(id),
    data
  );
  return response.data.doctor;
}

export async function listAdminHealthAssistants(): Promise<
  AdminHealthAssistant[]
> {
  const response = await apiClient.get<{
    healthAssistants: AdminHealthAssistant[];
  }>(ADMIN_ENDPOINTS.HEALTH_ASSISTANTS);
  return response.data.healthAssistants;
}

export async function createAdminHealthAssistant(
  data: CreateStaffRequest
): Promise<AdminHealthAssistant> {
  const response = await apiClient.post<{
    healthAssistant: AdminHealthAssistant;
  }>(ADMIN_ENDPOINTS.HEALTH_ASSISTANTS, data);
  return response.data.healthAssistant;
}

export async function setAdminHealthAssistantActive(
  id: string,
  data: SetActiveRequest
): Promise<AdminHealthAssistant> {
  const response = await apiClient.patch<{
    healthAssistant: AdminHealthAssistant;
  }>(ADMIN_ENDPOINTS.HEALTH_ASSISTANT_ACTIVE(id), data);
  return response.data.healthAssistant;
}

export async function listAdminPatients(): Promise<AdminPatient[]> {
  const response = await apiClient.get<{ patients: AdminPatient[] }>(
    ADMIN_ENDPOINTS.PATIENTS
  );
  return response.data.patients;
}

export async function setAdminPatientActive(
  id: string,
  data: SetActiveRequest
): Promise<AdminPatient> {
  const response = await apiClient.patch<{ patient: AdminPatient }>(
    ADMIN_ENDPOINTS.PATIENT_ACTIVE(id),
    data
  );
  return response.data.patient;
}
