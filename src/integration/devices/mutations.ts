import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createDevice,
  updateDevice,
  deleteDevice,
  connectDevice,
  disconnectDevice,
} from './api-functions';
import type {
  CreateDeviceRequest,
  UpdateDeviceRequest,
  ConnectDeviceRequest,
} from './types';
import { DEVICE_QUERY_KEYS } from './query-keys';

const useDeviceMutations = () => {
  const queryClient = useQueryClient();

  const invalidateDeviceQueries = () => {
    queryClient.invalidateQueries({ queryKey: DEVICE_QUERY_KEYS.ALL });
  };

  const createDeviceMutation = useMutation({
    mutationFn: (data: CreateDeviceRequest) => createDevice(data),
    onSuccess: () => {
      invalidateDeviceQueries();
    },
  });

  const updateDeviceMutation = useMutation({
    mutationFn: ({
      deviceId,
      data,
    }: {
      deviceId: string;
      data: UpdateDeviceRequest;
    }) => updateDevice(deviceId, data),
    onSuccess: () => {
      invalidateDeviceQueries();
    },
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: (deviceId: string) => deleteDevice(deviceId),
    onSuccess: () => {
      invalidateDeviceQueries();
    },
  });

  const connectDeviceMutation = useMutation({
    mutationFn: ({
      deviceId,
      data,
    }: {
      deviceId: string;
      data?: ConnectDeviceRequest;
    }) => connectDevice(deviceId, data),
    onSuccess: () => {
      invalidateDeviceQueries();
    },
  });

  const disconnectDeviceMutation = useMutation({
    mutationFn: (deviceId: string) => disconnectDevice(deviceId),
    onSuccess: () => {
      invalidateDeviceQueries();
    },
  });

  return {
    createDeviceMutation,
    updateDeviceMutation,
    deleteDeviceMutation,
    connectDeviceMutation,
    disconnectDeviceMutation,
  };
};

export default useDeviceMutations;
