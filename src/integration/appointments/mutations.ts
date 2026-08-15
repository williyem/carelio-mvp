import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAppointment,
  cancelAppointment,
  getAppointmentById,
  submitSoapNotes,
  rescheduleAppointment,
  completeConsultation,
  startConsultation,
  updateConsultationNote,
  getConsultationNoteByAppointment,
  shareConsultationPlan,
} from './api-functions';
import { APPOINTMENT_QUERY_KEYS } from './query-keys';
import type {
  CreateAppointmentRequest,
  CancelAppointmentRequest,
  SubmitSoapNotesRequest,
  RescheduleAppointmentRequest,
  UpdateConsultationNoteRequest,
  ShareConsultationPlanRequest,
} from './types';

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) => createAppointment(data),
    onSuccess: () => {
      // Invalidate appointments list to refetch
      queryClient.invalidateQueries({
        queryKey: [APPOINTMENT_QUERY_KEYS.DOCTOR_APPOINTMENTS],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: [APPOINTMENT_QUERY_KEYS.RECENT_APPOINTMENTS],
      });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CancelAppointmentRequest;
    }) => cancelAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [APPOINTMENT_QUERY_KEYS.DOCTOR_APPOINTMENTS],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: [APPOINTMENT_QUERY_KEYS.RECENT_APPOINTMENTS],
        exact: false,
      });
    },
  });
};

export const useGetAppointmentByIdMutation = () => {
  return useMutation({
    mutationFn: (id: string) => getAppointmentById(id),
  });
};

export const useSubmitSoapNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      data,
    }: {
      appointmentId: string;
      data: SubmitSoapNotesRequest;
    }) => submitSoapNotes(appointmentId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [APPOINTMENT_QUERY_KEYS.PATIENT_NOTES],
      });
      queryClient.invalidateQueries({
        queryKey: [APPOINTMENT_QUERY_KEYS.APPOINTMENT_NOTE],
      });
      queryClient.invalidateQueries({
        queryKey: [
          APPOINTMENT_QUERY_KEYS.PATIENT_NOTES,
          variables.appointmentId,
        ],
      });
    },
  });
};

export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: RescheduleAppointmentRequest;
    }) => rescheduleAppointment(id, data),
    onSuccess: () => {
      // Invalidate appointments list to refetch
      queryClient.invalidateQueries({
        queryKey: [APPOINTMENT_QUERY_KEYS.DOCTOR_APPOINTMENTS],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: [APPOINTMENT_QUERY_KEYS.RECENT_APPOINTMENTS],
      });
    },
  });
};

export const useStartConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) => startConsultation(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [APPOINTMENT_QUERY_KEYS.DOCTOR_APPOINTMENTS],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: [APPOINTMENT_QUERY_KEYS.PATIENT_APPOINTMENTS],
        exact: false,
      });
    },
  });
};

export const useCompleteConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) => completeConsultation(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [APPOINTMENT_QUERY_KEYS.DOCTOR_APPOINTMENTS],
      });
      queryClient.invalidateQueries({
        queryKey: [APPOINTMENT_QUERY_KEYS.RECENT_APPOINTMENTS],
      });
    },
  });
};

export const useUpdateConsultationNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteId,
      data,
    }: {
      noteId: string;
      data: UpdateConsultationNoteRequest;
    }) => updateConsultationNote(noteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [APPOINTMENT_QUERY_KEYS.PATIENT_NOTES],
      });
      queryClient.invalidateQueries({
        queryKey: [APPOINTMENT_QUERY_KEYS.APPOINTMENT_NOTE],
      });
    },
  });
};

export const useShareConsultationPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      data,
    }: {
      appointmentId: string;
      data: ShareConsultationPlanRequest;
    }) => shareConsultationPlan(appointmentId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [APPOINTMENT_QUERY_KEYS.PATIENT_NOTES],
      });
      queryClient.invalidateQueries({
        queryKey: [APPOINTMENT_QUERY_KEYS.APPOINTMENT_NOTE],
      });
      queryClient.invalidateQueries({
        queryKey: [
          APPOINTMENT_QUERY_KEYS.PATIENT_NOTES,
          variables.appointmentId,
        ],
      });
    },
  });
};

export const useGetConsultationNoteByAppointmentMutation = () => {
  return useMutation({
    mutationFn: (appointmentId: string) =>
      getConsultationNoteByAppointment(appointmentId),
  });
};
