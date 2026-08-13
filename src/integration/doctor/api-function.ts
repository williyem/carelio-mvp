import { apiClient } from '../config';
import { PatientConsultationTokenResponse } from '../patient/type';
import { extractResponseData } from '../utils';
import { DOCTOR_API_ENDPOINTS } from './endpoint';
import { DoctorUser } from '../auth/doctor';
import { ApiResponse } from '../config';

export const getDoctorConsultationToken = async (
  consultationId: string
): Promise<PatientConsultationTokenResponse> => {
  const response = await apiClient.get<
    ApiResponse<PatientConsultationTokenResponse>
  >(`/consultations/${consultationId}/token`);
  return extractResponseData(response);
};

export const getDoctorProfile = async (): Promise<DoctorUser> => {
  const response = await apiClient.get<ApiResponse<DoctorUser>>(
    DOCTOR_API_ENDPOINTS.PROFILE
  );
  return extractResponseData(response);
};
