/**
 * Health Assistant Authentication Endpoints
 * All endpoints are constants to prevent typos and ensure type safety
 * Note: /api prefix is handled by apiClient baseURL
 */

const HEALTH_ASSISTANT_AUTH_BASE = '/auth/health-assistant' as const;

export const HEALTH_ASSISTANT_ENDPOINTS = {
  REGISTER: `${HEALTH_ASSISTANT_AUTH_BASE}/register`,
  LOGIN: `${HEALTH_ASSISTANT_AUTH_BASE}/login`,
  REFRESH_TOKEN: `${HEALTH_ASSISTANT_AUTH_BASE}/refresh`,
  LOGOUT: `${HEALTH_ASSISTANT_AUTH_BASE}/logout`,
  SESSION: `${HEALTH_ASSISTANT_AUTH_BASE}/session`,
} as const;

/**
 * Type-safe endpoint getter
 */
export type HealthAssistantEndpoint =
  (typeof HEALTH_ASSISTANT_ENDPOINTS)[keyof typeof HEALTH_ASSISTANT_ENDPOINTS];
