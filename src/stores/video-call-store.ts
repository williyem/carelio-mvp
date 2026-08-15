import { create } from 'zustand';
import { Patient } from '@/types/patient.types';
import { Appointment } from '@/types/appointment.types';
import type { Room } from 'livekit-client';
import { readPortalIdentity, type CallParticipantRole } from '@/lib/call-join';

export interface PreviewSettings {
  isMuted: boolean;
  activeCamera: string;
  activeMicrophone: string;
  activeSpeaker: string;
  isVideoOn: boolean;
}

export type CallClient = Room;
/** @deprecated Use CallClient */
export type ZoomClientType = CallClient;

interface VideoCallState {
  client: CallClient | null;
  setClient: (client: CallClient | null) => void;
  isActive: boolean;
  isMinimized: boolean;
  isInPreview: boolean;
  patient: Patient | null;
  callDuration: number;
  pipPosition: { x: number; y: number };
  previewSettings: PreviewSettings | null;
  startCall: (patient: Patient) => void;
  endCall: () => void;
  toggleMinimize: () => void;
  updateCallDuration: (duration: number) => void;
  setPipPosition: (x: number, y: number) => void;
  setPreviewSettings: (settings: PreviewSettings) => void;
  startCallFromPreview: () => void;
  closePreview: () => void;
  setSelectedAppointment: (
    appointment: Appointment | null,
    patient: Patient | null
  ) => void;
  selectedAppointment: Appointment | null;
  selectedPatient: Patient | null;
  participantRole: CallParticipantRole | null;
  setParticipantRole: (role: CallParticipantRole | null) => void;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  isVideoPaused: boolean;
  setIsVideoPaused: (isVideoPaused: boolean) => void;
  isJoining: boolean;
  setIsJoining: (isJoining: boolean) => void;
  postConsultationAppointmentId: string | null;
  setPostConsultationAppointmentId: (appointmentId: string | null) => void;
}

const clearCallFields = {
  isActive: false,
  isMinimized: false,
  isInPreview: false,
  patient: null,
  callDuration: 0,
  previewSettings: null,
  selectedAppointment: null,
  selectedPatient: null,
  participantRole: null,
  client: null,
} as const;

export const useVideoCallStore = create<VideoCallState>((set) => ({
  client: null,
  setClient: (client) => set({ client }),
  isActive: false,
  isMinimized: false,
  isInPreview: false,
  patient: null,
  callDuration: 0,
  pipPosition: { x: 0, y: 0 },
  previewSettings: null,
  selectedAppointment: null,
  selectedPatient: null,
  participantRole: null,
  setParticipantRole: (role) => set({ participantRole: role }),
  startCall: (patient: Patient) =>
    set({
      isActive: true,
      isMinimized: false,
      isInPreview: true,
      patient,
      callDuration: 0,
      participantRole: readPortalIdentity()?.role ?? null,
    }),
  endCall: () =>
    set({
      ...clearCallFields,
    }),
  toggleMinimize: () =>
    set((state) => ({
      isMinimized: !state.isMinimized,
    })),
  updateCallDuration: (duration: number) =>
    set({
      callDuration: duration,
    }),
  setPipPosition: (x: number, y: number) =>
    set({
      pipPosition: { x, y },
    }),
  setPreviewSettings: (settings: PreviewSettings) =>
    set({
      previewSettings: settings,
    }),
  startCallFromPreview: () =>
    set({
      isInPreview: false,
    }),
  closePreview: () =>
    set({
      ...clearCallFields,
    }),
  setSelectedAppointment: (
    appointment: Appointment | null,
    patient: Patient | null
  ) =>
    set({
      selectedAppointment: appointment,
      selectedPatient: patient,
      participantRole:
        readPortalIdentity()?.role ??
        useVideoCallStore.getState().participantRole,
    }),
  isMuted: false,
  setIsMuted: (isMuted: boolean) =>
    set({
      isMuted: isMuted,
    }),
  isVideoPaused: false,
  setIsVideoPaused: (isVideoPaused: boolean) =>
    set({
      isVideoPaused: isVideoPaused,
    }),
  isJoining: false,
  setIsJoining: (isJoining: boolean) =>
    set({
      isJoining: isJoining,
    }),
  postConsultationAppointmentId: null,
  setPostConsultationAppointmentId: (appointmentId: string | null) =>
    set({ postConsultationAppointmentId: appointmentId }),
}));
