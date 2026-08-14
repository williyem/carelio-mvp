export interface AdminDoctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
}

export interface AdminHealthAssistant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  staffCode: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminPatient {
  id: string;
  patientId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  isRegistrationComplete: boolean;
  createdAt: string;
}

export interface CreateStaffRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface SetActiveRequest {
  isActive: boolean;
}
