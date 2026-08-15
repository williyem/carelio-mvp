import { extractResponseData } from '..';
import { ApiResponse, apiClient } from '../config';
import { VITALS_API_ENDPOINTS } from './endpoints';
import { CreateVitalRequest, VitalRecord, ConfirmVitalsRequest } from './type';
import { Vital } from '@/types/vitals.types';

export const createVital = async (
  data: CreateVitalRequest
): Promise<VitalRecord> => {
  const response = await apiClient.post<ApiResponse<VitalRecord>>(
    VITALS_API_ENDPOINTS.CREATE,
    data
  );
  return extractResponseData(response);
};

export const getVitalsByAppointment = async (
  appointmentId: string
): Promise<Vital[]> => {
  const response = await apiClient.get<ApiResponse<Vital[]>>(
    VITALS_API_ENDPOINTS.GET_BY_APPOINTMENT.replace(
      ':appointmentId',
      appointmentId
    )
  );
  return extractResponseData(response);
};

export const confirmVitals = async (
  appointmentId: string,
  data: ConfirmVitalsRequest
): Promise<void> => {
  const response = await apiClient.post<ApiResponse<void>>(
    VITALS_API_ENDPOINTS.CONFIRM.replace(':appointmentId', appointmentId),
    data
  );
  return extractResponseData(response);
};

export const rejectVitals = async (
  appointmentId: string,
  data: ConfirmVitalsRequest
): Promise<void> => {
  const response = await apiClient.post<ApiResponse<void>>(
    VITALS_API_ENDPOINTS.REJECT.replace(':appointmentId', appointmentId),
    data
  );
  return extractResponseData(response);
};
