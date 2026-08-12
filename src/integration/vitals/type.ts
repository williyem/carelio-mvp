export type VitalType =
  | 'thermometer'
  | 'blood-pressure'
  | 'pulse-ox'
  | 'glucose'
  | 'weight-scale'
  | 'stethoscope'
  | 'microscope';

export interface VitalReading {
  recordedAt: string;
  [key: string]: unknown;
}

export interface CreateVitalRequest {
  appointmentId: string;
  patientId: string;
  vitalType: VitalType;
  reading: Record<string, unknown>;
  recordedAt: string;
}

export interface VitalRecord extends CreateVitalRequest {
  id: string;
  isConfirmed: boolean;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConfirmVitalsRequest {
  vitalIds: string[];
}
