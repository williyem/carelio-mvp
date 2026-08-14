export interface Patient {
  id: string;
  fullName?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodType?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  address?: string;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  chiefComplaint?: string;
  patientId: string;
  name: string;
  isRegistrationComplete?: boolean;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  description: string;
  type?: 'in-person' | 'virtual';
}

export interface HIERecord {
  id: string;
  hospitalName: string;
  date: string;
  department: string;
  provider: string;
  diagnosis: string;
  summary: string;
}

export interface PatientSearchResult {
  id: string;
  name: string;
  email: string;
}

export type PatientTab = 'appointments';
