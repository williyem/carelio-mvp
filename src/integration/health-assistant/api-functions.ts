import { ApiResponse, apiClient } from '../config';
import { extractResponseData } from '../utils';
import { HEALTH_ASSISTANT_API_ENDPOINTS } from './endpoints';
import {
  RegisterPatientData,
  RegisteredPatient,
  HealthAssistantResponse,
  VerifyPatientResponse,
  DoctorsResponse,
  HealthAssistantStats,
  HealthAssistantProfile,
} from './types';
import { Clinician } from '@/types/clinician.types';
import { mapHealthAssistantsToClinicians } from '@/lib/easy';

export const registerPatient = async (
  data: RegisterPatientData
): Promise<RegisteredPatient> => {
  const response = await apiClient.post<ApiResponse<RegisteredPatient>>(
    HEALTH_ASSISTANT_API_ENDPOINTS.REGISTER_PATIENT,
    data
  );
  return extractResponseData(response);
};

export const getHealthAssistants = async (): Promise<Clinician[]> => {
  const response = await apiClient.get<ApiResponse<HealthAssistantResponse[]>>(
    HEALTH_ASSISTANT_API_ENDPOINTS.GET_HEALTH_ASSISTANTS
  );
  const assistants = extractResponseData(response);
  return mapHealthAssistantsToClinicians(assistants);
};

export const verifyPatientPhone = async (
  patientId: string
): Promise<VerifyPatientResponse> => {
  const endpoint = HEALTH_ASSISTANT_API_ENDPOINTS.VERIFY_PATIENT_PHONE.replace(
    ':id',
    patientId
  );
  const response =
    await apiClient.post<ApiResponse<VerifyPatientResponse>>(endpoint);
  return extractResponseData(response);
};

export const verifyPatientEmail = async (
  patientId: string
): Promise<VerifyPatientResponse> => {
  const endpoint = HEALTH_ASSISTANT_API_ENDPOINTS.VERIFY_PATIENT_EMAIL.replace(
    ':id',
    patientId
  );
  const response =
    await apiClient.post<ApiResponse<VerifyPatientResponse>>(endpoint);
  return extractResponseData(response);
};

export const verifyPatientCode = async (
  patientId: string,
  code: string,
  type: 'email'
): Promise<VerifyPatientResponse> => {
  const endpoint = HEALTH_ASSISTANT_API_ENDPOINTS.VERIFY_PATIENT_CODE.replace(
    ':id',
    patientId
  );
  const response = await apiClient.post<ApiResponse<VerifyPatientResponse>>(
    endpoint,
    { code, type }
  );
  return extractResponseData(response);
};

export const getDoctors = async (): Promise<DoctorsResponse> => {
  const response = await apiClient.get<ApiResponse<DoctorsResponse>>(
    HEALTH_ASSISTANT_API_ENDPOINTS.GET_DOCTORS
  );
  return extractResponseData(response);
};

export const getHealthAssistantStats =
  async (): Promise<HealthAssistantStats> => {
    const response = await apiClient.get<ApiResponse<HealthAssistantStats>>(
      HEALTH_ASSISTANT_API_ENDPOINTS.GET_STATS
    );
    return extractResponseData(response);
  };

export const getHealthAssistantProfile =
  async (): Promise<HealthAssistantProfile> => {
    const response = await apiClient.get<ApiResponse<HealthAssistantProfile>>(
      HEALTH_ASSISTANT_API_ENDPOINTS.PROFILE
    );

    return extractResponseData(response);
  };
