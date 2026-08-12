/**
 * Health Assistant Authentication Module - Barrel Export
 * Export all types, functions, hooks, and constants
 */

// Types
export type * from './types';

// Endpoints
export { HEALTH_ASSISTANT_ENDPOINTS, DOCTOR_ENDPOINTS } from './endpoints';
export type { HealthAssistantEndpoint, DoctorEndpoint } from './endpoints';

// API Functions
export * from './api-functions';

// Mutations
export * from './mutations';
export { HEALTH_ASSISTANT_MUTATION_KEYS } from './mutations';

// Queries
export * from './queries/use-session';
export * from './queries/use-invite-patient';
export {
  HEALTH_ASSISTANT_SESSION_QUERY_KEY,
  DOCTOR_SESSION_QUERY_KEY,
} from './queries/use-session';
export { getInvitePatientQueryKey } from './queries/use-invite-patient';
