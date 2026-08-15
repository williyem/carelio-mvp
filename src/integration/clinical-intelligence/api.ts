import { apiClient } from '../config';
import { extractResponseData } from '../utils';
import type {
  ExtractMeasurementsResponse,
  MeasurementState,
  MeasurementType,
} from './types';

export async function getMeasurementRequests(appointmentId: string) {
  const response = await apiClient.get<MeasurementState>(
    `/consultations/${appointmentId}/measurement-requests`
  );
  return extractResponseData(response);
}

export async function setDeviceCaptureEnabled(
  appointmentId: string,
  enabled: boolean
) {
  const response = await apiClient.patch<MeasurementState>(
    `/consultations/${appointmentId}/device-capture`,
    { enabled }
  );
  return extractResponseData(response);
}

export async function extractMeasurements(appointmentId: string, text: string) {
  const response = await apiClient.post<ExtractMeasurementsResponse>(
    `/consultations/${appointmentId}/extract-measurements`,
    { text }
  );
  return extractResponseData(response);
}

export async function confirmMeasurementRequests(
  appointmentId: string,
  requestIds: string[]
) {
  const response = await apiClient.post<MeasurementState>(
    `/consultations/${appointmentId}/measurement-requests`,
    { requestIds }
  );
  return extractResponseData(response);
}

export async function addManualMeasurementRequests(
  appointmentId: string,
  vitalTypes: MeasurementType[]
) {
  const response = await apiClient.post<MeasurementState>(
    `/consultations/${appointmentId}/measurement-requests/manual`,
    { vitalTypes }
  );
  return extractResponseData(response);
}

export async function respondToMeasurementRequest(
  appointmentId: string,
  requestId: string,
  status: 'acknowledged' | 'no_device' | 'completed',
  patientResponse?: string
) {
  const response = await apiClient.patch<MeasurementState>(
    `/consultations/${appointmentId}/measurement-requests/${requestId}`,
    { status, patientResponse }
  );
  return extractResponseData(response);
}

export type { MeasurementType } from './types';
