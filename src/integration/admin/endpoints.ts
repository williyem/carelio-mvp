const ADMIN_BASE = '/admin' as const;

export const ADMIN_ENDPOINTS = {
  DOCTORS: `${ADMIN_BASE}/doctors`,
  DOCTOR_ACTIVE: (id: string) => `${ADMIN_BASE}/doctors/${id}/active`,
  HEALTH_ASSISTANTS: `${ADMIN_BASE}/health-assistants`,
  HEALTH_ASSISTANT_ACTIVE: (id: string) =>
    `${ADMIN_BASE}/health-assistants/${id}/active`,
  PATIENTS: `${ADMIN_BASE}/patients`,
  PATIENT_ACTIVE: (id: string) => `${ADMIN_BASE}/patients/${id}/active`,
} as const;
