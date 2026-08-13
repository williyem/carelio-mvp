import { extractResponseData } from '..';
import { HEALTH_ASSISTANT_API_ENDPOINTS } from '../auth/health-assistant/endpoints';
import { ApiResponse, apiClient, backendApiClient } from '../config';
import { PATIENT_API_ENDPOINTS, PATIENT_ENDPOINTS } from './endpoints';
import type {
  Patient,
  AssignedPatient,
  PatientSearchParams,
  PatientSearchResponse,
  GetAssignedPatientsParams,
  AssignPatientRequest,
  InvitePatientRequest,
  InvitePatientResponse,
  UnassignPatientResponse,
  PatientConsultationTokenResponse,
} from './type';

/**
 * Search all patients (doctor portal)
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
 * Get patients assigned to a health assistant (doctor view)
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

export const searchAssignedPatients = async (
  params: PatientSearchParams & { assistantId: string }
): Promise<PatientSearchResponse> => {
  const response = await apiClient.get<ApiResponse<PatientSearchResponse>>(
    HEALTH_ASSISTANT_API_ENDPOINTS.SEARCH_ASSIGNED_PATIENTS,
    {
      params: {
        search: params.search,
        page: params.page,
        limit: params.limit,
        assistantId: params.assistantId,
      },
    }
  );
  return extractResponseData(response);
};

export const searchUnAssignedPatients = async (
  params: PatientSearchParams
): Promise<PatientSearchResponse> => {
  const response = await apiClient.get<ApiResponse<PatientSearchResponse>>(
    PATIENT_API_ENDPOINTS.SEARCH_UNASSIGNED_PATIENTS,
    {
      params: {
        search: params.search,
        page: params.page,
        limit: params.limit,
      },
    }
  );
  return extractResponseData(response);
};

export const searchAssignedHealthAssistantsPatients = async (
  params: PatientSearchParams
): Promise<PatientSearchResponse> => {
  const response = await apiClient.get<ApiResponse<PatientSearchResponse>>(
    PATIENT_API_ENDPOINTS.SEARCH_ASSIGNED_HEALTH_ASSISTANTS_PATIENTS,
    {
      params: {
        search: params.search,
        page: params.page,
        limit: params.limit,
      },
    }
  );
  return extractResponseData(response);
};

export const searchAllPatients = async (
  params: PatientSearchParams
): Promise<PatientSearchResponse> => {
  const response = await apiClient.get<ApiResponse<PatientSearchResponse>>(
    PATIENT_API_ENDPOINTS.SEARCH_ALL,
    {
      params: {
        search: params.search,
        page: params.page,
        limit: params.limit,
      },
    }
  );
  return extractResponseData(response);
};

export const getPatientById = async (id: string): Promise<AssignedPatient> => {
  const response = await apiClient.get<ApiResponse<AssignedPatient>>(
    PATIENT_API_ENDPOINTS.GET_PATIENT_BY_ID.replace(':id', id)
  );
  return extractResponseData(response);
};

export const getHealthAssistantPatientById = async (
  id: string
): Promise<AssignedPatient> => {
  const response = await apiClient.get<ApiResponse<AssignedPatient>>(
    PATIENT_API_ENDPOINTS.HA_GET_PATIENT_BY_ID.replace(':id', id)
  );
  return extractResponseData(response);
};

export const assignPatient = async (
  data: AssignPatientRequest
): Promise<Patient> => {
  const response = await apiClient.post<ApiResponse<Patient>>(
    PATIENT_API_ENDPOINTS.ASSIGN_PATIENT,
    data
  );
  return extractResponseData(response);
};

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

export const invitePatient = async (
  data: InvitePatientRequest
): Promise<InvitePatientResponse> => {
  const response = await apiClient.post<ApiResponse<InvitePatientResponse>>(
    PATIENT_API_ENDPOINTS.INVITE_PATIENT,
    data
  );
  return extractResponseData(response);
};

export const getPatientConsultationToken = async (
  patientId: string
): Promise<PatientConsultationTokenResponse> => {
  const response = await apiClient.get<
    ApiResponse<PatientConsultationTokenResponse>
  >(
    PATIENT_API_ENDPOINTS.GET_PATIENT_CONSULTATION_TOKEN.replace(
      ':id',
      patientId
    )
  );
  return extractResponseData(response);
};

export const submitConsentForm = async ({
  token,
  agreements,
}: {
  token: string;
  agreements: {
    type: string;
    signatureUrl: string;
    documentUrl: string;
  }[];
}): Promise<void> => {
  const response = await backendApiClient.post(
    PATIENT_ENDPOINTS.SUBMIT_CONSENT_FORM,
    { agreements, token: token }
  );
  return extractResponseData(response);
};

export const submitConsentAgreement = async ({
  token,
  agreements,
}: {
  token: string;
  agreements: {
    type: string;
    signatureUrl: string;
    documentUrl: string;
  }[];
}): Promise<void> => {
  const response = await apiClient.post(
    PATIENT_API_ENDPOINTS.SUBMIT_CONSENT_AGREEMENT,
    { agreements },
    {
      params: { token },
    }
  );
  return extractResponseData(response);
};
