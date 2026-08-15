import type { MeasurementType } from '@/lib/measurement-catalog';

export type { MeasurementType };

export type MeasurementRequestStatus =
  | 'suggested'
  | 'requested'
  | 'acknowledged'
  | 'no_device'
  | 'completed'
  | 'cancelled';

export type MeasurementRequestSource = 'ai' | 'rules' | 'manual';

export type MeasurementRequest = {
  id: string;
  vitalType: string;
  label: string;
  source: MeasurementRequestSource;
  status: MeasurementRequestStatus;
  patientResponse: string | null;
  requestedAt: string | null;
  respondedAt: string | null;
};

export type MeasurementState = {
  deviceCaptureEnabled: boolean;
  requests: MeasurementRequest[];
};

export type ExtractMeasurementsResponse = MeasurementState & {
  strategy: 'ai' | 'rules';
  degraded: boolean;
};

export type PatientAiSummary = {
  summary: string;
  noteCount: number;
  generatedAt: string;
  generatedByDoctorId?: string | null;
  cached?: boolean;
};

export type VisitAiSummary = {
  summary: string;
  generatedAt: string;
};
