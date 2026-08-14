/**
 * Patient Authentication Types
 * Advanced TypeScript types with branded types for IDs
 */

/**
 * Branded type for Patient ID
 */
export type PatientId = string & { readonly __brand: 'PatientId' };

/**
 * Branded type for Refresh Token
 */
export type RefreshToken = string & { readonly __brand: 'RefreshToken' };

/**
 * Branded type for Access Token
 */
export type AccessToken = string & { readonly __brand: 'AccessToken' };

/**
 * Branded type for Invitation Token
 */
export type InvitationToken = string & { readonly __brand: 'InvitationToken' };

/**
 * Gender enum
 */
export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;

export type Gender = (typeof GENDER)[keyof typeof GENDER];

/**
 * Blood Type enum
 */
export const BLOOD_TYPE = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
} as const;

export type BloodType = (typeof BLOOD_TYPE)[keyof typeof BLOOD_TYPE];

/**
 * Patient Login Request
 */
export interface PatientLoginRequest {
  patientId: PatientId;
}

/**
 * Patient Login Response
 */
export interface PatientLoginResponse {
  tokenData: {
    access: {
      token: AccessToken;
      expires: string;
    };
    refresh: {
      token: RefreshToken;
      expires: string;
    };
  };
  user: PatientUser;
}

/**
 * Refresh Token Request
 */
export interface RefreshTokenRequest {
  refreshToken: RefreshToken;
}

/**
 * Refresh Token Response
 */
export interface RefreshTokenResponse {
  accessToken: AccessToken;
  refreshToken: RefreshToken;
}

/**
 * Verify Invitation Request
 */
export interface VerifyInvitationRequest {
  token: InvitationToken;
}

/**
 * Verify Invitation Response
 */
export interface VerifyInvitationResponse {
  email: string | null;
  phoneNumber: string | null;
  invitationMethod: 'email' | 'phone';
  doctorName: string;
  fullName: string;
  dob: string;
  gender: Gender;
  address: string;
  bloodType: BloodType;
}

/**
 * Complete Registration Request
 */
export interface CompleteRegistrationRequest {
  token: string;
  fullName: string;
  dob: string; // ISO date string
  gender: Gender;
  phoneNumber: string;
  address: string;
  bloodType: BloodType;
  email?: string;
  agreements?: Record<string, { pdf: Blob; original?: Blob | string }>;
}

/**
 * Complete Registration Response
 */
export interface CompleteRegistrationResponse {
  accessToken: AccessToken;
  refreshToken: RefreshToken;
  user: PatientUser;
}

/**
 * Patient User Object
 */
export interface PatientUser {
  id: PatientId;
  patientId?: string;
  email: string;
  fullName: string;
  dob: string;
  gender: Gender;
  phoneNumber: string;
  address: string;
  bloodType: BloodType;
  isRegistrationComplete?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get Session Response
 */
export interface GetSessionResponse {
  user: PatientUser;
}

/**
 * Logout Response
 */
export interface LogoutResponse {
  message: string;
}
