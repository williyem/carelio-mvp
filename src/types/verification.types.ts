export interface VerificationStepData {
  method: 'email';
  contactValue: string;
  verificationCode?: string;
  clinicianId?: string;
  [key: string]: unknown;
}

export type VerificationStep = 'send-code' | 'enter-code';
