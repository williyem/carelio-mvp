import { DoctorUser } from '../auth/doctor';
import { ApiResponse, apiClient } from '../config';
import { PatientConsultationTokenResponse } from '../patient/type';
import { extractResponseData } from '../utils';
import { DOCTOR_API_ENDPOINTS } from './endpoint';

export const getDoctorConsultationToken = async (
  consultationId: string
): Promise<PatientConsultationTokenResponse> => {
  const response = await apiClient.get<
    ApiResponse<PatientConsultationTokenResponse>
  >(
    DOCTOR_API_ENDPOINTS.GET_DOCTOR_CONSULTATION_TOKEN.replace(
      ':id',
      consultationId
    )
  );
  return extractResponseData(response);
};

export const getDoctorProfile = async (): Promise<DoctorUser> => {
  const response = await apiClient.get<ApiResponse<DoctorUser>>(
    DOCTOR_API_ENDPOINTS.PROFILE
  );
  return extractResponseData(response);
};
