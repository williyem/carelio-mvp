export interface HealthRecord {
  id: string;
  patientName: string;
  date: string;
  recordType?: string;
}

export interface Vitals {
  heartRate: string;
  bloodPressure: string;
  temperature: string;
  oxygen: string;
}

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string[];
}

export interface HealthRecordDetails {
  id: string;
  date: string;
  vitals: Vitals;
  soapNote: SOAPNote;
}
