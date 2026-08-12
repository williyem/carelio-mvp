export type VitalType =
  | 'thermometer'
  | 'pulse-ox'
  | 'blood-pressure'
  | 'glucose'
  | 'weight-scale';
export type VitalStatus = 'pending' | 'confirmed' | 'discarded';

export interface ThermometerReading {
  temperatureC: number;
  temperatureF: number;
  ambientC?: number;
  ambientF?: number;
}

export interface PulseOxReading {
  spo2: number;
  pulse?: number;
  pi?: number;
}

export interface BloodPressureReading {
  systolic: number;
  diastolic?: number;
  pulse?: number;
  irregularHeartbeat?: boolean;
}

export interface GlucoseReading {
  value: number;
  type?: number;
  subType?: number;
  subValue?: number;
}

export interface WeightScaleReading {
  weightKg: number;
  weightLbs?: number;
  bmi?: number;
  bodyFat?: number;
  basalMetabolicRate?: number;
}

export type VitalReading =
  | ThermometerReading
  | PulseOxReading
  | BloodPressureReading
  | GlucoseReading
  | WeightScaleReading;

export interface Vital {
  id: string;
  appointmentId: string;
  patientId: string;
  recordedByAssistantId: string;
  vitalType: VitalType;
  reading: VitalReading;
  deviceId: string | null;
  recordedAt: string;
  status: VitalStatus;
  createdAt: string;
  updatedAt: string;
  recordedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Formatted vitals for display
export interface FormattedVitals {
  heartRate: string | null;
  bloodPressure: string | null;
  temperature: string | null;
  oxygenSaturation: string | null;
  respirationRate: string | null;
  weight: string | null;
  glucose: string | null;
  lastUpdated: string | null;
}
