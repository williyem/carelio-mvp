import { extractResponseData } from '..';
import { HEALTH_ASSISTANT_API_ENDPOINTS } from '../auth/health-assistant/endpoints';
import { HEALTH_ASSISTANT_API_ENDPOINTS as HA_STAFF_API } from '../health-assistant/endpoints';
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

export type StaffPortal = 'doctor' | 'health-assistant';

export const staffVerifyPatientEmail = async (
  patientId: string,
  portal: StaffPortal
) => {
  const endpoint =
    portal === 'health-assistant'
      ? HA_STAFF_API.VERIFY_PATIENT_EMAIL.replace(':id', patientId)
      : PATIENT_API_ENDPOINTS.VERIFY_PATIENT_EMAIL.replace(':id', patientId);
  const response =
    await apiClient.post<ApiResponse<{ linked?: boolean }>>(endpoint);
  return extractResponseData(response);
};

export const staffVerifyPatientCode = async (
  patientId: string,
  code: string,
  portal: StaffPortal
) => {
  const endpoint =
    portal === 'health-assistant'
      ? HA_STAFF_API.VERIFY_PATIENT_CODE.replace(':id', patientId)
      : PATIENT_API_ENDPOINTS.VERIFY_PATIENT_CODE.replace(':id', patientId);
  const response = await apiClient.post<ApiResponse<{ linked?: boolean }>>(
    endpoint,
    { code, type: 'email' }
  );
  return extractResponseData(response);
};

export const requestDoctorAccess = async (
  patientId: string,
  doctorId: string
) => {
  const endpoint = PATIENT_API_ENDPOINTS.REQUEST_DOCTOR_ACCESS.replace(
    ':id',
    patientId
  );
  const response = await apiClient.post<
    ApiResponse<{ message: string; doctorName: string }>
  >(endpoint, { doctorId });
  return extractResponseData(response);
};

export const getDoctorAccessRequest = async (token: string) => {
  const endpoint = PATIENT_API_ENDPOINTS.GET_DOCTOR_ACCESS_REQUEST.replace(
    ':token',
    token
  );
  const response = await apiClient.get<
    ApiResponse<{
      status: string;
      patientName: string;
      doctorName: string;
    }>
  >(endpoint);
  return extractResponseData(response);
};

export const resolveDoctorAccessRequest = async (
  token: string,
  action: 'approve' | 'decline'
) => {
  const endpoint = (
    action === 'approve'
      ? PATIENT_API_ENDPOINTS.APPROVE_DOCTOR_ACCESS
      : PATIENT_API_ENDPOINTS.DECLINE_DOCTOR_ACCESS
  ).replace(':token', token);
  const response =
    await apiClient.post<ApiResponse<{ status: string }>>(endpoint);
  return extractResponseData(response);
};

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
