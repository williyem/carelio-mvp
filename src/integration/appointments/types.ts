// ============================================
// Telehealth / Video Call Types
// ============================================

export interface TelehealthInfo {
  id: string;
  doctorId: string;
  appointmentId: string;
  patientId: string;
  doctorToken: string;
  patientToken: string;
  zoomSessionId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Patient Info (embedded in appointment)
// ============================================

export interface AppointmentPatient {
  id: string;
  patientId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  isRegistrationComplete?: boolean;
}

// ============================================
// Doctor Info (embedded in appointment)
// ============================================

export interface AppointmentDoctor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string | null;
  isActive: boolean;
}

// ============================================
// Appointment Types
// ============================================

export type AppointmentStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'MISSED';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  isImmediate?: boolean;
  status: AppointmentStatus;
  code?: string;
  cancellationReason?: string | null;
  reschedulingReason?: string | null;
  cancelledBy?: string | null;
  cancelledByUserType?: 'doctor' | 'patient' | null;
  createdAt: string;
  updatedAt: string;
  doctor: AppointmentDoctor;
  patient?: AppointmentPatient;
  telehealth?: TelehealthInfo;
}

// ============================================
// Request Types
// ============================================

export interface GetDoctorAppointmentsParams {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  upcoming?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface CreateAppointmentRequest {
  patientId: string;
  isImmediate: boolean;
  startTime?: string;
  endTime?: string;
}

export interface CancelAppointmentRequest {
  cancellationReason: string;
}

export interface UpdateConsultationNoteRequest {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  action?: 'approve' | 'save';
}

export interface RescheduleAppointmentRequest {
  startTime: string;
  endTime: string;
  reschedulingReason?: string;
}

export interface SubmitSoapNotesRequest {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  action: 'approve' | 'save';
}

export interface GetPatientNotesParams {
  page?: number;
  limit?: number;
  search?: string;
}

// ============================================
// Response Types
// ============================================

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export type DoctorAppointmentsResponse = PaginatedResponse<Appointment>;

export type CreateAppointmentResponse = Appointment;

export type CancelAppointmentResponse = Appointment;

// ============================================
// SOAP Note Types
// ============================================

export interface SoapNote {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
}

export interface AppointmentNote {
  id: string;
  appointmentId: string;
  telehealthId?: string;
  summary?: string | null;
  generatedNote?: string | null;
  status: 'DRAFT' | 'FINAL';
  soapNote?: SoapNote;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  appointment?: Appointment;
  // Backward compatibility - flatten soapNote fields
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
}

export type AppointmentNotesResponse = PaginatedResponse<AppointmentNote>;

// ============================================
// Backwards Compatibility Aliases
// ============================================

/** @deprecated Use DoctorAppointmentsResponse instead */
export type PatientAppointmentsResponse = PaginatedResponse<Appointment>;

/** @deprecated Use CreateAppointmentRequest instead */
export interface ScheduleAppointmentRequest {
  patientId: string;
  isImmediate: boolean;
  doctorId?: string;
  startTime?: string;
  endTime?: string;
}

/** @deprecated Use CreateAppointmentResponse instead */
export type ScheduleAppointmentResponse = Appointment;

export interface UpcomingAppointment extends Appointment {
  patient: AppointmentPatient & {
    firstName?: string;
    lastName?: string;
    dob?: string;
    gender?: string;
    address?: string;
    bloodType?: string;
    phoneVerified?: boolean;
    emailVerified?: boolean;
    isActive?: boolean;
  };
}

export interface UpcomingAppointmentsResponse {
  docs: UpcomingAppointment[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface AppointmentItemData {
  id: string;
  date: string;
  time: string;
  description: string;
  doctor: AppointmentDoctor;
  status?: string;
  timeRemaining?: string;
}
