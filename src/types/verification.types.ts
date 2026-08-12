export interface VerificationStepData {
  method: 'phone' | 'email';
  contactValue: string; // phone number or email
  verificationCode?: string;
  clinicianId?: string;
  [key: string]: unknown;
}

export type VerificationStep = 'send-code' | 'enter-code';
