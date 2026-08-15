'use client';

import { toast } from 'sonner';
import { useVideoCallStore } from '@/stores/video-call-store';
import type { Appointment } from '@/types/appointment.types';
import type { Patient } from '@/types/patient.types';
import { getCallJoinError, readPortalIdentity } from '@/lib/call-join';

export function useBeginCall() {
  const startCall = useVideoCallStore((state) => state.startCall);
  const setSelectedAppointment = useVideoCallStore(
    (state) => state.setSelectedAppointment
  );

  return (appointment: Appointment | null, patient: Patient | null) => {
    const identity = readPortalIdentity();
    const error = getCallJoinError(appointment, identity);
    if (error) {
      toast.error(error);
      return false;
    }

    if (patient) startCall(patient);
    setSelectedAppointment(appointment, patient);
    return true;
  };
}
