import { create } from 'zustand';
import { Patient } from '@/types/patient.types';
import { Appointment } from '@/integration/appointments/types';
import ZoomVideo from '@zoom/videosdk';
export interface PreviewSettings {
  isMuted: boolean;
  activeCamera: string;
  activeMicrophone: string;
  activeSpeaker: string;
  isVideoOn: boolean;
}

export type ZoomClientType = ReturnType<typeof ZoomVideo.createClient>;

interface VideoCallState {
  client: ZoomClientType | null;
  setClient: (client: ZoomClientType) => void;
  isActive: boolean;
  isMinimized: boolean;
  isInPreview: boolean;
  patient: Patient | null;
  callDuration: number; // in seconds
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
  setSelectedAppointment: (appointment: Appointment, patient: Patient) => void;
  selectedAppointment: Appointment | null;
  selectedPatient: Patient | null;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  isVideoPaused: boolean;
  setIsVideoPaused: (isVideoPaused: boolean) => void;
  isJoining: boolean;
  setIsJoining: (isJoining: boolean) => void;
  postConsultationAppointmentId: string | null;
  setPostConsultationAppointmentId: (appointmentId: string | null) => void;
}

export const useVideoCallStore = create<VideoCallState>((set) => ({
  client: null,
  setClient: (client: ZoomClientType) => set({ client }),
  isActive: false,
  isMinimized: false,
  isInPreview: false,
  patient: null,
  callDuration: 0,
  pipPosition: { x: 0, y: 0 },
  previewSettings: null,
  selectedAppointment: null,
  selectedPatient: null,
  startCall: (patient: Patient) =>
    set({
      isActive: true,
      isMinimized: false,
      isInPreview: true,
      patient,
      callDuration: 0,
    }),
  endCall: () =>
    set({
      isActive: false,
      isMinimized: false,
      isInPreview: false,
      patient: null,
      callDuration: 0,
      previewSettings: null,
      selectedAppointment: null,
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
    set((state) => ({
      isInPreview: false,
    })),
  closePreview: () =>
    set({
      isActive: false,
      isMinimized: false,
      isInPreview: false,
      patient: null,
      callDuration: 0,
      previewSettings: null,
      selectedAppointment: null,
    }),
  setSelectedAppointment: (appointment: Appointment, patient: Patient) =>
    set({
      selectedAppointment: appointment,
      selectedPatient: patient,
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
