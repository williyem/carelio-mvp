import { ApiResponse, apiClient } from '../config';
import { extractResponseData } from '../utils';
import { DEVICE_ENDPOINTS } from './endpoints';
import type {
  Device,
  DevicesResponse,
  CreateDeviceRequest,
  UpdateDeviceRequest,
  ConnectDeviceRequest,
} from './types';

export const getDevices = async (): Promise<DevicesResponse> => {
  const response = await apiClient.get<ApiResponse<DevicesResponse>>(
    DEVICE_ENDPOINTS.GET_DEVICES
  );
  return extractResponseData(response);
};

export const getKnownDevices = async (): Promise<DevicesResponse> => {
  const response = await apiClient.get<ApiResponse<DevicesResponse>>(
    DEVICE_ENDPOINTS.GET_KNOWN_DEVICES
  );
  return extractResponseData(response);
};

export const getUnknownDevices = async (): Promise<DevicesResponse> => {
  const response = await apiClient.get<ApiResponse<DevicesResponse>>(
    DEVICE_ENDPOINTS.GET_UNKNOWN_DEVICES
  );
  return extractResponseData(response);
};

export const getDevice = async (deviceId: string): Promise<Device> => {
  const endpoint = DEVICE_ENDPOINTS.GET_DEVICE.replace(':deviceId', deviceId);
  const response = await apiClient.get<ApiResponse<Device>>(endpoint);
  return extractResponseData(response);
};

export const createDevice = async (
  data: CreateDeviceRequest
): Promise<Device> => {
  const response = await apiClient.post<ApiResponse<Device>>(
    DEVICE_ENDPOINTS.CREATE_DEVICE,
    data
  );
  return extractResponseData(response);
};

export const updateDevice = async (
  deviceId: string,
  data: UpdateDeviceRequest
): Promise<Device> => {
  const endpoint = DEVICE_ENDPOINTS.UPDATE_DEVICE.replace(
    ':deviceId',
    deviceId
  );
  const response = await apiClient.put<ApiResponse<Device>>(endpoint, data);
  return extractResponseData(response);
};

export const deleteDevice = async (deviceId: string): Promise<void> => {
  const endpoint = DEVICE_ENDPOINTS.DELETE_DEVICE.replace(
    ':deviceId',
    deviceId
  );
  await apiClient.delete(endpoint);
};

export const connectDevice = async (
  deviceId: string,
  data?: ConnectDeviceRequest
): Promise<Device> => {
  const endpoint = DEVICE_ENDPOINTS.CONNECT_DEVICE.replace(
    ':deviceId',
    deviceId
  );
  const response = await apiClient.post<ApiResponse<Device>>(
    endpoint,
    data || {}
  );
  return extractResponseData(response);
};

export const disconnectDevice = async (deviceId: string): Promise<Device> => {
  const endpoint = DEVICE_ENDPOINTS.DISCONNECT_DEVICE.replace(
    ':deviceId',
    deviceId
  );
  const response = await apiClient.post<ApiResponse<Device>>(endpoint);
  return extractResponseData(response);
};
