'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addManualMeasurementRequests,
  confirmMeasurementRequests,
  extractMeasurements,
  getMeasurementRequests,
  respondToMeasurementRequest,
  setDeviceCaptureEnabled,
} from './api';
import type { MeasurementType } from './types';

export const measurementRequestsKey = (appointmentId: string) =>
  ['consultation', appointmentId, 'measurement-requests'] as const;

export function useMeasurementRequests(
  appointmentId: string | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: measurementRequestsKey(appointmentId || ''),
    queryFn: () => getMeasurementRequests(appointmentId!),
    enabled: !!appointmentId && enabled,
    refetchInterval: enabled && appointmentId ? 2000 : false,
  });
}

export function useDeviceCaptureToggle(appointmentId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) =>
      setDeviceCaptureEnabled(appointmentId!, enabled),
    onSuccess: (data) => {
      if (!appointmentId) return;
      queryClient.setQueryData(measurementRequestsKey(appointmentId), data);
    },
  });
}

export function useExtractMeasurements(appointmentId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => extractMeasurements(appointmentId!, text),
    onSuccess: (data) => {
      if (!appointmentId) return;
      queryClient.setQueryData(measurementRequestsKey(appointmentId), {
        deviceCaptureEnabled: data.deviceCaptureEnabled,
        requests: data.requests,
      });
    },
  });
}

export function useConfirmMeasurementRequests(
  appointmentId: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestIds: string[]) =>
      confirmMeasurementRequests(appointmentId!, requestIds),
    onSuccess: (data) => {
      if (!appointmentId) return;
      queryClient.setQueryData(measurementRequestsKey(appointmentId), data);
    },
  });
}

export function useAddManualMeasurementRequests(
  appointmentId: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vitalTypes: MeasurementType[]) =>
      addManualMeasurementRequests(appointmentId!, vitalTypes),
    onSuccess: (data) => {
      if (!appointmentId) return;
      queryClient.setQueryData(measurementRequestsKey(appointmentId), data);
    },
  });
}

export function useRespondToMeasurementRequest(
  appointmentId: string | undefined
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      status,
      patientResponse,
    }: {
      requestId: string;
      status: 'acknowledged' | 'no_device' | 'completed';
      patientResponse?: string;
    }) =>
      respondToMeasurementRequest(
        appointmentId!,
        requestId,
        status,
        patientResponse
      ),
    onSuccess: (data) => {
      if (!appointmentId) return;
      queryClient.setQueryData(measurementRequestsKey(appointmentId), data);
    },
  });
}
