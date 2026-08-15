export type PatientEmergencyContact = {
  name?: string;
  relationship?: string;
  phone?: string;
};

export function parseCommaSeparatedList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatCommaSeparatedList(items?: string[] | null): string {
  return (items ?? []).join(', ');
}

export function formatClinicalList(items?: string[] | string | null): string {
  if (!items) return 'None reported';
  if (typeof items === 'string') {
    const trimmed = items.trim();
    return trimmed || 'None reported';
  }
  if (items.length === 0) return 'None reported';
  return items.join(', ');
}

export function formatEmergencyContact(
  contact?: PatientEmergencyContact | null
): string {
  if (!contact) return 'None reported';
  const parts = [contact.name, contact.relationship, contact.phone]
    .map((part) => part?.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : 'None reported';
}

export function listMissingPatientClinicalFields(input: {
  allergies?: string[] | null;
  conditions?: string[] | null;
  emergencyContact?: PatientEmergencyContact | null;
}): string[] {
  const missing: string[] = [];
  if (!input.allergies?.length) missing.push('allergies');
  if (!input.conditions?.length) missing.push('medical conditions');
  const hasContact =
    Boolean(input.emergencyContact?.name?.trim()) ||
    Boolean(input.emergencyContact?.phone?.trim());
  if (!hasContact) missing.push('an emergency contact');
  return missing;
}

export function formatMissingClinicalPrompt(missing: string[]): string {
  if (missing.length === 0) return '';
  if (missing.length === 1) {
    return `Add ${missing[0]} so your doctor has this for every visit.`;
  }
  const last = missing[missing.length - 1];
  const rest = missing.slice(0, -1).join(', ');
  return `Add ${rest}, and ${last} so your doctor has this for every visit.`;
}

export function clinicalReviewStorageKey(patientId: string) {
  return `carelio.patient-clinical-reviewed:${patientId}`;
}
