export interface AppointmentRow {
  id: string;
  patientName: string;
  identityNumber: string;
  age: number;
  contact: {
    phone: string;
    email: string;
  };
  assignedAssistantId?: string | null;
  assignedAssistantName?: string;
  accountNumber?: string;
  insId?: string;
  isRegistrationComplete?: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  isImmediate?: boolean;
  date?: string; // ISO Date
  startTime?: string; // ISO Date
  endTime?: string; // ISO Date
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | string;
  code?: string;
  cancellationReason?: string | null;
  cancelledBy?: string | null;
  cancelledByUserType?: string | null;
  createdAt?: string;
  updatedAt?: string;
  doctor: Doctor;
  patient?: any;
  telehealth?: Telehealth;
}

export interface Doctor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string | null;
  isActive: boolean;
}

export interface Telehealth {
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
