import { extractResponseData } from '..';
import { ApiResponse, apiClient } from '../config';
import { PATIENT_API_ENDPOINTS } from './endpoints';
import type {
  Patient,
  PatientSearchParams,
  PatientSearchResponse,
  GetAssignedPatientsParams,
  AssignPatientRequest,
  InvitePatientRequest,
  InvitePatientResponse,
  UnassignPatientResponse,
} from './type';

/**
 * Search all patients (paginated)
 */
export const searchPatients = async (
  params?: PatientSearchParams
): Promise<PatientSearchResponse> => {
  const response = await apiClient.get<ApiResponse<PatientSearchResponse>>(
    PATIENT_API_ENDPOINTS.SEARCH_PATIENTS,
    { params }
  );
  return extractResponseData(response);
};

/**
 * Get patients assigned to a health assistant
 */
export const getAssignedPatients = async (
  params?: GetAssignedPatientsParams
): Promise<PatientSearchResponse> => {
  const response = await apiClient.get<ApiResponse<PatientSearchResponse>>(
    PATIENT_API_ENDPOINTS.GET_ASSIGNED_PATIENTS,
    { params }
  );
  return extractResponseData(response);
};

/**
 * Get a single patient by ID
 */
export const getPatientById = async (id: string): Promise<Patient> => {
  const endpoint = PATIENT_API_ENDPOINTS.GET_PATIENT_BY_ID.replace(':id', id);
  const response = await apiClient.get<ApiResponse<Patient>>(endpoint);
  return extractResponseData(response);
};

/**
 * Assign a patient to a health assistant
 */
export const assignPatient = async (
  data: AssignPatientRequest
): Promise<Patient> => {
  const response = await apiClient.post<ApiResponse<Patient>>(
    PATIENT_API_ENDPOINTS.ASSIGN_PATIENT,
    data
  );
  return extractResponseData(response);
};

/**
 * Unassign a patient from their health assistant
 */
export const unassignPatient = async (
  patientId: string
): Promise<UnassignPatientResponse> => {
  const endpoint = PATIENT_API_ENDPOINTS.UNASSIGN_PATIENT.replace(
    ':patientId',
    patientId
  );
  const response =
    await apiClient.delete<ApiResponse<UnassignPatientResponse>>(endpoint);
  return extractResponseData(response);
};

/**
 * Invite a patient by email (doctor only)
 */
export const invitePatient = async (
  data: InvitePatientRequest
): Promise<InvitePatientResponse> => {
  const response = await apiClient.post<ApiResponse<InvitePatientResponse>>(
    PATIENT_API_ENDPOINTS.INVITE_PATIENT,
    data
  );
  return extractResponseData(response);
};
