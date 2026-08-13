import { ApiResponse, apiClient } from '../config';
import { extractResponseData } from '../utils';
import { APPOINTMENT_API_ENDPOINTS } from './endpoints';
import type {
  DoctorAppointmentsResponse,
  GetDoctorAppointmentsParams,
  Appointment,
  CreateAppointmentRequest,
  CreateAppointmentResponse,
  CancelAppointmentRequest,
  CancelAppointmentResponse,
  AppointmentNotesResponse,
  GetPatientNotesParams,
  AppointmentNote,
  PatientAppointmentsResponse,
  SubmitSoapNotesRequest,
  RescheduleAppointmentRequest,
  UpdateConsultationNoteRequest,
  ScheduleAppointmentRequest,
  ScheduleAppointmentResponse,
  UpcomingAppointmentsResponse,
} from './types';

/**
 * Get all appointments for the logged-in doctor
 */
export const getDoctorAppointments = async (
  params?: GetDoctorAppointmentsParams
): Promise<DoctorAppointmentsResponse> => {
  const response = await apiClient.get<ApiResponse<DoctorAppointmentsResponse>>(
    APPOINTMENT_API_ENDPOINTS.GET_DOCTOR_APPOINTMENTS,
    { params }
  );
  return extractResponseData(response);
};

export const getAppointmentById = async (id: string): Promise<Appointment> => {
  const endpoint = APPOINTMENT_API_ENDPOINTS.GET_APPOINTMENT_BY_ID.replace(
    ':id',
    id
  );
  const response = await apiClient.get<ApiResponse<Appointment>>(endpoint);
  return extractResponseData(response);
};

export const createAppointment = async (
  data: CreateAppointmentRequest
): Promise<CreateAppointmentResponse> => {
  const response = await apiClient.post<ApiResponse<CreateAppointmentResponse>>(
    APPOINTMENT_API_ENDPOINTS.CREATE_APPOINTMENT,
    data
  );
  return extractResponseData(response);
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (
  id: string,
  data: CancelAppointmentRequest
): Promise<CancelAppointmentResponse> => {
  const endpoint = APPOINTMENT_API_ENDPOINTS.CANCEL_APPOINTMENT.replace(
    ':id',
    id
  );
  const response = await apiClient.patch<
    ApiResponse<CancelAppointmentResponse>
  >(endpoint, data);
  return extractResponseData(response);
};

/**
 * Get SOAP notes for a patient
 */
export const getPatientNotes = async (
  patientId: string,
  params?: GetPatientNotesParams
): Promise<AppointmentNotesResponse> => {
  const endpoint = APPOINTMENT_API_ENDPOINTS.GET_PATIENT_NOTES.replace(
    ':patientId',
    patientId
  );
  const response = await apiClient.get<ApiResponse<AppointmentNotesResponse>>(
    endpoint,
    { params }
  );
  return extractResponseData(response);
};

/**
 * Get a single SOAP note by ID
 */
export const getNoteById = async (noteId: string): Promise<AppointmentNote> => {
  const endpoint = APPOINTMENT_API_ENDPOINTS.GET_NOTE_BY_ID.replace(
    ':noteId',
    noteId
  );
  const response = await apiClient.get<ApiResponse<AppointmentNote>>(endpoint);
  return extractResponseData(response);
};

/**
 * Get SOAP note for a specific appointment
 */
export const getAppointmentNote = async (
  appointmentId: string
): Promise<AppointmentNote | null> => {
  const endpoint = APPOINTMENT_API_ENDPOINTS.GET_APPOINTMENT_NOTE.replace(
    ':appointmentId',
    appointmentId
  );
  try {
    const response =
      await apiClient.get<ApiResponse<AppointmentNote>>(endpoint);
    return extractResponseData(response);
  } catch (error: unknown) {
    // Return null if note doesn't exist (404)
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      (error as { response?: { status: number } }).response?.status === 404
    ) {
      return null;
    }
    throw error;
  }
};

/**
 * Get appointments for a specific patient
 * @deprecated Use getDoctorAppointments for doctor's own appointments
 */
export const getPatientAppointments = async (
  patientId: string,
  status?: 'COMPLETED' | 'CONFIRMED' | 'CANCELLED' | 'MISSED',
  page: number = 1,
  limit: number = 10
): Promise<PatientAppointmentsResponse> => {
  const endpoint = APPOINTMENT_API_ENDPOINTS.GET_PATIENT_APPOINTMENTS.replace(
    ':patientId',
    patientId
  );
  // Use URLSearchParams to ensure proper query string formatting
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status: status?.toString() || '',
  });
  const url = `${endpoint}?${params.toString()}`;
  const response =
    await apiClient.get<ApiResponse<PatientAppointmentsResponse>>(url);
  return extractResponseData(response);
};

/**
 * Get recent appointments for the logged-in doctor
 */
export const getRecentAppointments =
  async (): Promise<DoctorAppointmentsResponse> => {
    const response = await apiClient.get<
      ApiResponse<DoctorAppointmentsResponse>
    >(APPOINTMENT_API_ENDPOINTS.GET_RECENT_APPOINTMENTS);
    return extractResponseData(response);
  };

/**
 * Submit SOAP notes for an appointment
 */
export const submitSoapNotes = async (
  appointmentId: string,
  data: SubmitSoapNotesRequest
): Promise<AppointmentNote> => {
  const endpoint = APPOINTMENT_API_ENDPOINTS.SUBMIT_SOAP_NOTES.replace(
    ':appointmentId',
    appointmentId
  );
  const response = await apiClient.post<ApiResponse<AppointmentNote>>(
    endpoint,
    data
  );
  return extractResponseData(response);
};

/**
 * Reschedule an appointment
 */
export const rescheduleAppointment = async (
  id: string,
  data: RescheduleAppointmentRequest
): Promise<Appointment> => {
  const endpoint = APPOINTMENT_API_ENDPOINTS.RESCHEDULE_APPOINTMENT.replace(
    ':id',
    id
  );
  const response = await apiClient.patch<ApiResponse<Appointment>>(
    endpoint,
    data
  );
  return extractResponseData(response);
};

/**
 * Mark a consultation as complete
 */
export const completeConsultation = async (
  appointmentId: string
): Promise<Appointment> => {
  const endpoint = APPOINTMENT_API_ENDPOINTS.COMPLETE_CONSULTATION.replace(
    ':appointmentId',
    appointmentId
  );
  const response = await apiClient.post<ApiResponse<Appointment>>(endpoint);
  return extractResponseData(response);
};

/**
 * Update a consultation note
 */
export const updateConsultationNote = async (
  noteId: string,
  data: UpdateConsultationNoteRequest
): Promise<AppointmentNote> => {
  const endpoint = APPOINTMENT_API_ENDPOINTS.UPDATE_CONSULTATION_NOTE.replace(
    ':noteId',
    noteId
  );
  const response = await apiClient.put<ApiResponse<AppointmentNote>>(
    endpoint,
    data
  );
  return extractResponseData(response);
};

export const getConsultationNoteByAppointment = async (
  appointmentId: string
) => {
  const endpoint = APPOINTMENT_API_ENDPOINTS.GET_APPOINTMENT_NOTE.replace(
    ':appointmentId',
    appointmentId
  );
  const response = await apiClient.get<ApiResponse<AppointmentNote>>(endpoint);
  return extractResponseData(response);
};

export const scheduleAppointment = async (
  data: ScheduleAppointmentRequest
): Promise<ScheduleAppointmentResponse> => {
  const response = await apiClient.post<
    ApiResponse<ScheduleAppointmentResponse>
  >(APPOINTMENT_API_ENDPOINTS.SCHEDULE_APPOINTMENT, data);
  return extractResponseData(response);
};

export const schedulePatientAppointment = async (
  data: ScheduleAppointmentRequest
): Promise<ScheduleAppointmentResponse> => {
  const response = await apiClient.post<
    ApiResponse<ScheduleAppointmentResponse>
  >(APPOINTMENT_API_ENDPOINTS.PATIENT_SCHEDULE_APPOINTMENT, data);
  return extractResponseData(response);
};

export const getMyPatientAppointments = async (
  patientId: string,
  status?: 'COMPLETED' | 'CONFIRMED' | 'CANCELLED' | 'MISSED',
  page: number = 1,
  limit: number = 20
): Promise<PatientAppointmentsResponse> => {
  const params = new URLSearchParams({
    patientId,
    page: page.toString(),
    limit: limit.toString(),
  });
  if (status) params.set('status', status);

  const response = await apiClient.get<
    ApiResponse<PatientAppointmentsResponse>
  >(
    `${APPOINTMENT_API_ENDPOINTS.PATIENT_GET_APPOINTMENTS}?${params.toString()}`
  );
  return extractResponseData(response);
};

export const getUpcomingAppointments = async (
  page: number = 1,
  limit: number = 5
): Promise<UpcomingAppointmentsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  const endpoint = `${APPOINTMENT_API_ENDPOINTS.GET_UPCOMING_APPOINTMENTS}?${params.toString()}`;
  const response =
    await apiClient.get<ApiResponse<UpcomingAppointmentsResponse>>(endpoint);
  return extractResponseData(response);
};
