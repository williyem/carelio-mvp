/**
 * Health Assistant Authentication Types
 * Advanced TypeScript types with branded types for IDs
 */

/**
 * Branded type for Health Assistant ID
 */
export type HealthAssistantId = string & {
  readonly __brand: 'HealthAssistantId';
};

/**
 * Branded type for Refresh Token
 */
export type RefreshToken = string & { readonly __brand: 'RefreshToken' };

/**
 * Branded type for Access Token
 */
export type AccessToken = string & { readonly __brand: 'AccessToken' };

/**
 * Health Assistant Registration Request
 */
export interface HealthAssistantRegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

/**
 * Health Assistant Login Request
 */
export interface HealthAssistantLoginRequest {
  staffCode: string;
}

/**
 * Health Assistant Login Response
 */
export interface HealthAssistantLoginResponse {
  accessToken: AccessToken;
  refreshToken: RefreshToken;
  user: HealthAssistantUser;
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
 * Health Assistant User Object
 */
export interface HealthAssistantUser {
  id: HealthAssistantId;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  staffCode: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get Session Response
 */
export interface GetSessionResponse {
  user: HealthAssistantUser;
}

/**
 * Logout Response
 */
export interface LogoutResponse {
  message: string;
}

export interface InvitePatientResponse {
  message: string;
  invitationToken?: string;
}

export interface InvitePatientRequest {
  email?: string;
  phoneNumber?: string;
}
