export type UserRole = 'health-assistant' | 'patient';

export interface LoginFormData {
  staffCode: string;
  role: UserRole;
}

export interface LoginFormErrors {
  staffCode?: string;
}
