import { mapHealthAssistantsToClinicians } from '@/lib/easy';
import { ApiResponse, apiClient } from '../config';
import { extractResponseData } from '../utils';
import { HEALTH_ASSISTANT_API_ENDPOINTS } from './endpoints';
import {
  HealthAssistantResponse,
  AssignHealthAssistantRequest,
  Clinician,
} from './types';
import { AssignedPatient } from '../patient/type';

export const getHealthAssistants = async (): Promise<Clinician[]> => {
  const response = await apiClient.get<ApiResponse<HealthAssistantResponse[]>>(
    HEALTH_ASSISTANT_API_ENDPOINTS.GET_HEALTH_ASSISTANTS
  );
  const assistants = extractResponseData(response);
  return mapHealthAssistantsToClinicians(assistants);
};

export const assignHealthAssistant = async (
  data: AssignHealthAssistantRequest
): Promise<AssignedPatient> => {
  const response = await apiClient.post<ApiResponse<AssignedPatient>>(
    HEALTH_ASSISTANT_API_ENDPOINTS.ASSIGN_HEALTH_ASSISTANT,
    data
  );
  return extractResponseData(response);
};
