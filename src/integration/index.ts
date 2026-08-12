/**
 * Integration Module - Main Barrel Export
 * Export all API integration modules
 */

// Config and Utils
export * from './config';
export * from './utils';

// Auth Modules - Export individually to avoid naming conflicts
// Import specific modules directly: import { useLoginDoctor } from '@/integration/auth/doctor'
// Or use namespaced imports: import * as DoctorAuth from '@/integration/auth/doctor'

// Re-export only non-conflicting items
export { DOCTOR_ENDPOINTS } from './auth/doctor/endpoints';
export { HEALTH_ASSISTANT_ENDPOINTS } from './auth/health-assistant/endpoints';
export { PATIENT_ENDPOINTS } from './auth/patient/endpoints';

export { DOCTOR_MUTATION_KEYS } from './auth/doctor/mutations';
export { HEALTH_ASSISTANT_MUTATION_KEYS } from './auth/health-assistant/mutations';
export { PATIENT_MUTATION_KEYS } from './auth/patient/mutations';

export { DOCTOR_SESSION_QUERY_KEY } from './auth/doctor/queries/use-session';
export { HEALTH_ASSISTANT_SESSION_QUERY_KEY } from './auth/health-assistant/queries/use-session';
export { PATIENT_SESSION_QUERY_KEY } from './auth/patient/queries/use-session';
