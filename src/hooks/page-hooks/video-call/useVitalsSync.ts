'use client';

import { useCallback, useRef } from 'react';
import { useCreateVital, type VitalType } from '@/integration/vitals';
import { useVideoCallStore } from '@/stores/video-call-store';

// Map device slug to vital type
const DEVICE_TO_VITAL_TYPE: Record<string, VitalType> = {
  thermometer: 'thermometer',
  'pulse-ox': 'pulse-ox',
  'blood-pressure': 'blood-pressure',
  glucose: 'glucose',
  'weight-scale': 'weight-scale',
  stethoscope: 'stethoscope',
  microscope: 'microscope',
};

interface UseVitalsSyncOptions {
  onSyncSuccess?: (vitalId: string) => void;
  onSyncError?: (error: Error) => void;
}

export function useVitalsSync(options: UseVitalsSyncOptions = {}) {
  const { onSyncSuccess, onSyncError } = options;
  const createVitalMutation = useCreateVital();
  const pendingSyncsRef = useRef<Set<string>>(new Set());

  const { selectedAppointment, selectedPatient } = useVideoCallStore();

  const syncReading = useCallback(
    async (deviceSlug: string, reading: unknown) => {
      // Only sync if we have an active appointment
      if (!selectedAppointment?.id || !selectedPatient?.id) {
        console.log('No active appointment/patient, skipping vital sync');
        return;
      }

      const vitalType = DEVICE_TO_VITAL_TYPE[deviceSlug];
      if (!vitalType) {
        console.log('Unknown device type, skipping vital sync:', deviceSlug);
        return;
      }

      // Create a unique key for this reading to avoid duplicates
      const syncKey = `${deviceSlug}-${JSON.stringify(reading)}`;
      if (pendingSyncsRef.current.has(syncKey)) {
        return;
      }

      pendingSyncsRef.current.add(syncKey);

      try {
        const vital = await createVitalMutation.mutateAsync({
          appointmentId: selectedAppointment.id,
          patientId: selectedPatient.id,
          vitalType,
          reading: reading as Record<string, unknown>,
          recordedAt: new Date().toISOString(),
        });

        onSyncSuccess?.(vital.id);
        console.log('Vital synced successfully:', vital.id);
      } catch (error) {
        console.error('Failed to sync vital:', error);
        onSyncError?.(error as Error);
      } finally {
        pendingSyncsRef.current.delete(syncKey);
      }
    },
    [
      selectedAppointment,
      selectedPatient,
      createVitalMutation,
      onSyncSuccess,
      onSyncError,
    ]
  );

  return {
    syncReading,
    isSyncing: createVitalMutation.isPending,
  };
}

export default useVitalsSync;
