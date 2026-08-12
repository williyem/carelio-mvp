export interface Clinician {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  twoFactorEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed field for backward compatibility
  name?: string;
  specialization?: string;
}

export interface mappedClinician {
  id: string;
  name: string;
  email: string;
}
