// ============================================
// Assigned Assistant Types
// ============================================

export interface AssignedAssistant {
  id: string;
  staffCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Patient Types
// ============================================

export interface Patient {
  id: string;
  patientId: string;
  fullName: string;
  dob: string;
  dateOfBirth?: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone?: string;
  phoneNumber?: string;
  address?: string;
  bloodType?: string;
  allergies?: string[];
  chiefComplaint?: string;
  invitedByDoctorId: string | null;
  assignedAssistantId: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedAssistant?: AssignedAssistant;
  isRegistrationComplete?: boolean;
}

/** Alias used by HA portal */
export type AssignedPatient = Patient;

// ============================================
// Request Types
// ============================================

export interface PatientSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  assistantId?: string;
}

export interface GetAssignedPatientsParams {
  assistantId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AssignPatientRequest {
  patientId: string;
  assistantId: string;
}

export interface InvitePatientRequest {
  email: string;
  phoneNumber?: string;
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

export type PatientSearchResponse = PaginatedResponse<Patient>;

export interface InvitePatientResponse {
  message: string;
  invitationId?: string;
  inviteLink?: string;
  patientId?: string;
}

export interface UnassignPatientResponse {
  message: string;
}

export interface PatientConsultationTokenResponse {
  token: string;
  code: string;
  url?: string;
}
