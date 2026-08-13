export interface RegisterPatientData {
  fullName: string;
  dob: string; // Date of birth in YYYY-MM-DD format
  gender: 'male' | 'female' | 'other';
  email: string;
  phoneNumber: string;
  address: string;
  bloodType: string;
}

export interface RegisteredPatient {
  createdAt: string;
  updatedAt: string;
  id: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  isActive: boolean;
  patientId: string;
  fullName: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  phoneNumber: string;
  address: string;
  bloodType: string;
  invitedByDoctorId: string | null;
  assignedAssistantId: string | null;
  isRegistrationComplete?: boolean;
}

export interface HealthAssistantResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AssignHealthAssistantRequest {
  patientId: string;
  assistantId: string;
}

export interface VerifyPatientRequest {
  patientId: string;
}

export interface VerifyPatientCodeRequest {
  code: string;
  type: 'email';
}

export interface VerifyPatientResponse {
  id: string;
  patientId: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  [key: string]: unknown;
}

export interface PatientRow {
  id: string;
  patientName: string;
  identityNumber: string;
  age: number | null;
  contact: {
    phone: string;
    email: string;
  };
  assignedAssistantId: string | null;
  assignedAssistantName?: string;
  isRegistrationComplete?: boolean;
}

export interface Doctor {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorsResponse {
  docs: Doctor[];
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

export interface HealthAssistantStats {
  totalMedicalAssistants: number;
  totalPatients: number;
  unassignedPatients: number;
}

export interface HealthAssistantProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  twoFactorEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
