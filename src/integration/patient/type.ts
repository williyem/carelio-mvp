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
  medications?: string[];
  conditions?: string[];
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  chiefComplaint?: string;
  invitedByDoctorId: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isRegistrationComplete?: boolean;
  linked?: boolean;
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

export interface PatientConsultationTokenResponse {
  token: string;
  code: string;
  url?: string;
}
