import { z } from 'zod';

/**
 * Address Schema
 */
export const AddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

/**
 * Location Schema (latitude/longitude)
 */
export const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

/**
 * Signed Agreement Data Schema
 */
export const SignedAgreementDataSchema = z.object({
  signature: z.string().optional(),
  name: z.string().optional(),
  date: z.string().optional(),
  location: LocationSchema.optional(),
  document: z.instanceof(Blob).optional(),
});

/**
 * Static Agreement Data Schema
 */
export const StaticAgreementDataSchema = z.object({
  date: z.string().optional(),
  location: LocationSchema.optional(),
  document: z.instanceof(Blob).optional(),
});

/**
 * Insurance Card Data Schema
 */
export const InsuranceCardDataSchema = z.object({
  front: z.instanceof(File).optional(),
  back: z.instanceof(File).optional(),
});

/**
 * Scholar Info Schema
 */
export const ScholarInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleNames: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  insuranceProvider: z.string().min(1, 'Insurance provider is required'),
  insuranceNumber: z.string().min(1, 'Insurance number is required'),
  schoolName: z.string().min(1, 'School name is required'),
  address: AddressSchema.optional(),
});

/**
 * Parent Info Schema
 */
export const ParentInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  emailAddress: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
});

/**
 * Agreements Schema
 */
export const AgreementsSchema = z.object({
  consent: SignedAgreementDataSchema.optional(),
  notice_of_privacy: SignedAgreementDataSchema.optional(),
  release_of_information: SignedAgreementDataSchema.optional(),
  grievance_policy: StaticAgreementDataSchema.optional(),
  clients_rights: StaticAgreementDataSchema.optional(),
});

/**
 * Patient Invite Form Schema (Main Schema)
 */
export const PatientInviteFormSchema = z.object({
  photos: z.array(z.instanceof(File)),
  insuranceCards: InsuranceCardDataSchema,
  scholarInfo: ScholarInfoSchema.partial(),
  parentInfo: ParentInfoSchema.partial(),
  inviteToken: z.string().optional(),
  agreements: AgreementsSchema,
});

export type PatientInviteFormData = z.infer<typeof PatientInviteFormSchema>;
