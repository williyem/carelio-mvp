import { z } from 'zod';
import {
  AddressSchema,
  LocationSchema,
  SignedAgreementDataSchema,
  StaticAgreementDataSchema,
  InsuranceCardDataSchema,
  ScholarInfoSchema,
  ParentInfoSchema,
  AgreementsSchema,
  PatientInviteFormSchema,
} from '@/schemas/patient-invite-schema';

/**
 * TypeScript types inferred from Zod schemas
 */
export type Address = z.infer<typeof AddressSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type SignedAgreementData = z.infer<typeof SignedAgreementDataSchema>;
export type StaticAgreementData = z.infer<typeof StaticAgreementDataSchema>;
export type InsuranceCardData = z.infer<typeof InsuranceCardDataSchema>;
export type ScholarInfo = z.infer<typeof ScholarInfoSchema>;
export type ParentInfo = z.infer<typeof ParentInfoSchema>;
export type Agreements = z.infer<typeof AgreementsSchema>;
export type PatientInviteFormData = z.infer<typeof PatientInviteFormSchema>;

/**
 * Additional interfaces for better IDE support and type safety
 */
export interface PatientInviteFormDataWithDefaults extends PatientInviteFormData {
  photos: File[];
  insuranceCards: InsuranceCardData;
  scholarInfo: Partial<ScholarInfo>;
  parentInfo: Partial<ParentInfo>;
  agreements: Agreements;
}
