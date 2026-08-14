/**
 * Doctor Authentication Types
 * Advanced TypeScript types with branded types for IDs and const assertions
 */

/**
 * Branded type for Doctor ID
 */
export type DoctorId = string & { readonly __brand: 'DoctorId' };

/**
 * Branded type for Patient ID
 */
export type PatientId = string & { readonly __brand: 'PatientId' };

/**
 * Branded type for 2FA Token
 */
export type TwoFactorToken = string & { readonly __brand: 'TwoFactorToken' };

/**
 * Branded type for Reset Token
 */
export type ResetToken = string & { readonly __brand: 'ResetToken' };

/**
 * Branded type for Refresh Token
 */
export type RefreshToken = string & { readonly __brand: 'RefreshToken' };

/**
 * Branded type for Access Token
 */
export type AccessToken = string & { readonly __brand: 'AccessToken' };

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
 * 2FA Method enum
 */
export const TWO_FA_METHOD = {
  TOTP: 'totp',
  EMAIL: 'email',
} as const;

export type TwoFactorMethod =
  (typeof TWO_FA_METHOD)[keyof typeof TWO_FA_METHOD];

/**
 * Doctor Registration Request
 */
export interface DoctorRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

/**
 * Doctor Login Request
 */
export interface DoctorLoginRequest {
  email: string;
  password: string;
}

/**
 * Doctor Login Response (when 2FA is NOT enabled)
 */
export interface DoctorLoginResponseWithout2FA {
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
  user: DoctorUser;
}

/**
 * Doctor Login Response (when 2FA IS enabled)
 */
export interface DoctorLoginResponseWith2FA {
  requires2FA: boolean;
  token: TwoFactorToken;
}

/**
 * Doctor Login Response - Union type for both cases
 */
export interface DoctorLoginResponseWithout2FA {
  requiresSetup: boolean;
  setupToken: TwoFactorToken;
}

export type DoctorLoginResponse =
  | DoctorLoginResponseWithout2FA
  | DoctorLoginResponseWith2FA;

/**
 * Verify 2FA Request
 */
export interface Verify2FARequest {
  token: TwoFactorToken;
  code: string;
}

/**
 * Verify 2FA Response
 */
export interface Verify2FAResponse {
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
  user: DoctorUser;
}

/**
 * Forgot Password Request
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Forgot Password Response
 */
export interface ForgotPasswordResponse {
  message: string;
}

/**
 * Verify OTP Request
 */
export interface VerifyOtpRequest {
  otp: string;
  email: string;
}

/**
 * Verify OTP Response
 */
export interface VerifyOtpResponse {
  token: ResetToken;
  message?: string;
}

/**
 * Reset Password Request
 */
export interface ResetPasswordRequest {
  password: string;
}

/**
 * Reset Password Response
 */
export interface ResetPasswordResponse {
  requiresSetup: boolean;
  setupToken: TwoFactorToken;
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
 * Change Password Request
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * Change Password Response
 */
export interface ChangePasswordResponse {
  message: string;
}

/**
 * Setup 2FA Request
 */
export interface Setup2FARequest {
  method: TwoFactorMethod;
}

/**
 * Setup 2FA Response
 */
export interface Setup2FAResponse {
  qrCode?: string;
  secret?: string;
  message: string;
}

/**
 * Enable 2FA Request
 */
export interface Enable2FARequest {
  code: string;
}

/**
 * Enable 2FA Response
 */
export interface Enable2FAResponse {
  message: string;
  recoveryCodes: string[];
}

/**
 * Disable 2FA Request
 */
export interface Disable2FARequest {
  password: string;
}

/**
 * Disable 2FA Response
 */
export interface Disable2FAResponse {
  message: string;
}

/**
 * Regenerate Recovery Codes Request
 */
export interface RegenerateRecoveryCodesRequest {
  password: string;
}

/**
 * Regenerate Recovery Codes Response
 */
export interface RegenerateRecoveryCodesResponse {
  recoveryCodes: string[];
}

/**
 * Doctor User Object
 */
export interface DoctorUser {
  id: DoctorId;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  twoFactorEnabled: boolean;
  twoFactorMethod?: TwoFactorMethod;
  isActive: boolean;
  isAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
  title?: string;
  specialty?: string;
  clinicName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  timezone?: string;
  npi?: string;
  licenseNumber?: string;
  phone?: string;
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: string | null;
  signedAgreementUrl?: string;
  signedName?: string;
}

/**
 * Get Session Response
 */
export interface GetSessionResponse {
  user: DoctorUser;
}

/**
 * Invite Patient Request
 */
export interface InvitePatientRequest {
  email: string;
  phoneNumber?: string;
}

/**
 * Invited Patient Object
 */
export interface InvitedPatient {
  id: string;
  createdAt: string;
  updatedAt: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  isActive: boolean;
  patientId: string;
  email: string | null;
  phoneNumber: string | null;
  invitedByDoctorId: string;
  isRegistrationComplete: boolean;
  fullName: string | null;
  dob: string | null;
  gender: string | null; // or specific type if needed
  address: string | null;
  bloodType: string | null;
}

/**
 * Invite Patient Response
 */
export interface InvitePatientResponse {
  message: string;
  inviteLink?: string;
  invitationMethod?: string;
  patientId: string;
  patient?: InvitedPatient;
  // keeping invitationToken for backward compatibility if needed, though not in new response
  invitationToken?: string;
}

/**
 * Logout Response
 */
export interface LogoutResponse {
  message: string;
}
