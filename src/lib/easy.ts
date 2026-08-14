import { DEFAULT_PAGE, DEFAULT_LIMIT } from './constants';
import { ReadonlyURLSearchParams } from 'next/navigation';
import type { AppointmentRow } from '@/types/appointment.types';
import type { AssignedPatient } from '@/integration/patient/type';
import { toast } from 'sonner';
import { Appointment } from '@/integration/appointments';
import { HealthAssistantResponse } from '@/integration/health-assistant/types';

type Clinician = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  twoFactorEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  name: string;
};
import {
  BloodPressureReading,
  GlucoseReading,
  PulseOxReading,
  ThermometerReading,
  Vital,
  WeightScaleReading,
} from '@/types/vitals.types';
import { format, isValid, parseISO } from 'date-fns';

export const mapHealthAssistantToClinician = (
  assistant: HealthAssistantResponse
): Clinician => {
  return {
    id: assistant.id,
    firstName: assistant.firstName,
    lastName: assistant.lastName,
    email: assistant.email,
    phoneNumber: '', // Not available in API response
    twoFactorEnabled: false, // Not available in API response
    isActive: true, // Default to true
    createdAt: '', // Not available in API response
    updatedAt: '', // Not available in API response
    name: `${assistant.firstName} ${assistant.lastName}`.trim(), // Computed for backward compatibility
  };
};

export const mapHealthAssistantsToClinicians = (
  assistants: HealthAssistantResponse[]
): Clinician[] => {
  return assistants.map(mapHealthAssistantToClinician);
};

const GMT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * Format a clock time in hardcoded GMT (UTC). No local timezone conversion.
 */
const formatGmtClock = (date: Date): string => {
  const hours24 = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${minutes} ${ampm}`;
};

/**
 * Format appointment date from ISO string in GMT
 * (e.g., "2026-01-29T09:00:15.201Z" → "Jan 29, 2026")
 */
export const formatAppointmentDate = (startTime?: string): string => {
  if (!startTime) return '';

  try {
    const date = new Date(startTime);
    if (isNaN(date.getTime())) return '';

    return `${GMT_MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
  } catch (error) {
    console.warn('Failed to format appointment date:', error);
    return '';
  }
};

/**
 * Format appointment time range in GMT (e.g., "9:00 AM - 10:00 AM GMT")
 */
export const formatAppointmentTimeRange = (
  startTime?: string,
  endTime?: string
): string => {
  if (!startTime || !endTime) return '';

  try {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return '';

    return `${formatGmtClock(startDate)} - ${formatGmtClock(endDate)} GMT`;
  } catch (error) {
    console.warn('Failed to format appointment time range:', error);
    return '';
  }
};

/**
 * Determine if "Start Now" button should be enabled
 * Returns true if current time is >= (startTime - 5 minutes) AND < endTime
 */
export const canStartAppointment = (
  startTime: string,
  endTime: string,
  status: string,
  patientStatus: boolean = true,
  now: Date = new Date()
): boolean => {
  if (
    status?.toLowerCase() === 'completed' ||
    status?.toLowerCase() === 'cancelled' ||
    status?.toLowerCase() === 'missed' ||
    !patientStatus
  ) {
    return false;
  }
  if (!startTime || !endTime) return false;

  try {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;

    // 5 minutes in milliseconds
    const fiveMinutesInMs = 5 * 60 * 1000;
    const earliestStartTime = new Date(startDate.getTime() - fiveMinutesInMs);

    // Current time must be >= (startTime - 5 minutes) AND < endTime
    return now >= earliestStartTime && now < endDate;
  } catch (error) {
    console.warn('Failed to check if appointment can start:', error);
    return false;
  }
};

export const generateSessionNameFromAppointment = (
  appointment: Appointment
): string => {
  return `Appointment with ${getFullNameFromUser(appointment.doctor)} - ${appointment.date} - ${appointment.code}`;
};

export const getFullNameFromUser = (user: {
  firstName: string;
  lastName: string;
}): string => {
  return `${user?.firstName} ${user?.lastName}`.trim();
};

// --- Helper functions ---

export function formatTimeFromISO(isoString: string | undefined): string {
  if (!isoString) return '';
  try {
    const date = parseISO(isoString);
    if (Number.isNaN(date.getTime())) return '';
    return `${formatGmtClock(date)} GMT`;
  } catch {
    return '';
  }
}

export function getHourFromISO(isoString: string | undefined): number {
  if (!isoString) return 0;
  try {
    const date = parseISO(isoString);
    return date.getHours();
  } catch {
    return 0;
  }
}

/**
 * Calculate duration in minutes between startTime and endTime
 */
export function calculateDuration(
  startTime: string | undefined,
  endTime: string | undefined
): number {
  if (!startTime || !endTime) return 0;
  try {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    const durationMs = end.getTime() - start.getTime();
    return Math.max(0, Math.floor(durationMs / (1000 * 60)));
  } catch {
    return 0;
  }
}

/**
 * Format duration in minutes to a human readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
}

export const DEFAULT_MIN_HOUR = 8; // 8:00 AM
export const DEFAULT_MAX_HOUR = 20; // 8:00 PM

/**
 * Calculate dynamic working hours based on appointments.
 * Ensures the scheduler covers at least the default range,
 * but expands if there are earlier or later appointments.
 */
export function getDynamicWorkingHours(appointments: Appointment[]) {
  let minHour = DEFAULT_MIN_HOUR;
  let maxHour = DEFAULT_MAX_HOUR;

  appointments.forEach((apt) => {
    if (apt.startTime) {
      const start = parseISO(apt.startTime);
      if (Number.isNaN(start.getTime())) return;
      const startHour = start.getHours();
      minHour = Math.min(minHour, startHour);
      // Ensure we show at least the hour the appointment starts in
      maxHour = Math.max(maxHour, startHour);

      if (apt.endTime) {
        const end = parseISO(apt.endTime);
        if (Number.isNaN(end.getTime())) return;
        let endHour = end.getHours();

        // Handle midnight/next day
        if (
          end.getDate() !== start.getDate() ||
          end.getMonth() !== start.getMonth()
        ) {
          endHour = 24;
        } else if (endHour === 0 && end.getMinutes() === 0) {
          // If it ends exactly at 00:00 of same day (unlikely but for safety)
          // Actually if it's 00:00 and it's after start, it's technically 24
          endHour = 24;
        }

        // If it ends at 10:15, we want to show up to at least the 10:00-11:00 slot.
        // The hour label represents the start of the hour.
        // So maxHour should be the last label.
        // If it ends at 23:30, we need label 23:00.
        // If it ends at 24:00, we need label 23:00.
        const lastLabelNeeded = endHour - (end.getMinutes() === 0 ? 1 : 0);
        maxHour = Math.max(maxHour, lastLabelNeeded);
      }
    }
  });

  // Ensure maxHour is at least minHour
  maxHour = Math.max(maxHour, minHour);

  const hours: string[] = [];
  for (let i = minHour; i <= maxHour; i++) {
    const period = i >= 12 && i < 24 ? 'PM' : 'AM';
    const displayHour = i % 12 === 0 ? 12 : i % 12;
    hours.push(`${displayHour.toString().padStart(2, '0')}:00 ${period}`);
  }

  return { hours, minHour, maxHour };
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatVitals = (vitals: Vital[]) => {
  if (!vitals || vitals.length === 0) {
    return {
      heartRate: null,
      bloodPressure: null,
      temperature: null,
      oxygenSaturation: null,
      respirationRate: null,
      weight: null,
      glucose: null,
      lastUpdated: null,
    };
  }

  const vitalsByType: Record<string, Vital> = {};
  let lastUpdated: Date | null = null;

  vitals.forEach((vital) => {
    const recordedAt = new Date(vital.recordedAt);
    if (!lastUpdated || recordedAt > lastUpdated) {
      lastUpdated = recordedAt;
    }

    const existing = vitalsByType[vital.vitalType];
    if (!existing || recordedAt > new Date(existing.recordedAt)) {
      vitalsByType[vital.vitalType] = vital;
    }
  });

  // Extract heart rate from pulse-ox or blood-pressure
  let heartRate: string | null = null;
  const pulseOx = vitalsByType['pulse-ox'];
  const bp = vitalsByType['blood-pressure'];

  if (pulseOx?.reading) {
    const reading = pulseOx.reading as PulseOxReading;
    if (reading.pulse) {
      heartRate = `${reading.pulse} bpm`;
    }
  } else if (bp?.reading) {
    const reading = bp.reading as BloodPressureReading;
    if (reading.pulse) {
      heartRate = `${reading.pulse} bpm`;
    }
  }

  // Blood pressure
  let bloodPressure: string | null = null;
  if (bp?.reading) {
    const reading = bp.reading as BloodPressureReading;
    if (reading.systolic) {
      bloodPressure = reading.diastolic
        ? `${reading.systolic}/${reading.diastolic} mmHg`
        : `${reading.systolic} mmHg`;
    }
  }

  // Temperature
  let temperature: string | null = null;
  const thermo = vitalsByType['thermometer'];
  if (thermo?.reading) {
    const reading = thermo.reading as ThermometerReading;
    if (reading.temperatureF) {
      temperature = `${reading.temperatureF.toFixed(1)}°F`;
    } else if (reading.temperatureC) {
      temperature = `${reading.temperatureC.toFixed(1)}°C`;
    }
  }

  // O2 Saturation
  let oxygenSaturation: string | null = null;
  if (pulseOx?.reading) {
    const reading = pulseOx.reading as PulseOxReading;
    if (reading.spo2) {
      oxygenSaturation = `${reading.spo2}%`;
    }
  }

  // Weight
  let weight: string | null = null;
  const weightVital = vitalsByType['weight-scale'];
  if (weightVital?.reading) {
    const reading = weightVital.reading as WeightScaleReading;
    if (reading.weightLbs) {
      weight = `${reading.weightLbs.toFixed(1)} lbs`;
    } else if (reading.weightKg) {
      weight = `${reading.weightKg.toFixed(1)} kg`;
    }
  }

  // Glucose
  let glucose: string | null = null;
  const glucoseVital = vitalsByType['glucose'];
  if (glucoseVital?.reading) {
    const reading = glucoseVital.reading as GlucoseReading;
    if (reading.value) {
      glucose = `${reading.value} mg/dL`;
    }
  }

  return {
    heartRate,
    bloodPressure,
    temperature,
    oxygenSaturation,
    respirationRate: null, // Not captured by current devices
    weight,
    glucose,
    lastUpdated: lastUpdated ? formatTime(lastUpdated) : null,
  };
};

export function formatVitalValue(vital: Vital): string {
  const reading = (vital.reading || {}) as unknown as Record<string, unknown>;
  if (reading.value != null && reading.value !== '') {
    const note = reading.note ? ` (${reading.note})` : '';
    return `${reading.value}${note}`;
  }

  switch (vital.vitalType) {
    case 'blood-pressure': {
      const bp = vital.reading as BloodPressureReading;
      if (bp.systolic && bp.diastolic)
        return `${bp.systolic}/${bp.diastolic} mmHg`;
      if (bp.systolic) return `${bp.systolic} mmHg`;
      break;
    }
    case 'thermometer': {
      const thermo = vital.reading as ThermometerReading;
      if (thermo.temperatureF)
        return `${Number(thermo.temperatureF).toFixed(1)}°F`;
      if (thermo.temperatureC)
        return `${Number(thermo.temperatureC).toFixed(1)}°C`;
      break;
    }
    case 'pulse-ox': {
      const ox = vital.reading as PulseOxReading;
      const parts: string[] = [];
      if (ox.spo2) parts.push(`SpO₂ ${ox.spo2}%`);
      if (ox.pulse) parts.push(`${ox.pulse} bpm`);
      if (parts.length) return parts.join(' · ');
      break;
    }
    case 'weight-scale': {
      const weight = vital.reading as WeightScaleReading;
      if (weight.weightLbs) return `${Number(weight.weightLbs).toFixed(1)} lbs`;
      if (weight.weightKg) return `${Number(weight.weightKg).toFixed(1)} kg`;
      break;
    }
    case 'glucose': {
      const glucose = vital.reading as GlucoseReading;
      if (glucose.value) return `${glucose.value} mg/dL`;
      break;
    }
    default:
      break;
  }

  return 'Recorded';
}

/**
 * Get full name from user object with firstName and lastName
 */
export const getFullName = (
  user: { firstName: string; lastName: string } | null
): string => {
  if (!user) return '';
  return `${user.firstName} ${user.lastName}`.trim();
};

/**
 * Get first name from user object
 */
export const getFirstName = (user: { firstName: string } | null): string => {
  if (!user) return '';
  return user.firstName || '';
};

export const calculateAge = (dob?: string | null): number | null => {
  if (!dob || !String(dob).trim()) return null;
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age >= 0 ? age : null;
};

export const extractSearchParams = (searchParams: ReadonlyURLSearchParams) => ({
  search: searchParams.get('search') || '',
  page: Number(searchParams.get('page')) || DEFAULT_PAGE,
  limit: Number(searchParams.get('limit')) || DEFAULT_LIMIT,
});

export const createSearchParams = (
  currentParams: ReadonlyURLSearchParams,
  searchValue: string,
  resetPage = true
): URLSearchParams => {
  const params = new URLSearchParams(currentParams);
  if (searchValue) {
    params.set('search', searchValue);
    if (resetPage) params.set('page', String(DEFAULT_PAGE));
  } else {
    params.delete('search');
  }
  return params;
};

export const mapAssignedPatientToAppointmentRow = (
  patient: AssignedPatient
): AppointmentRow => ({
  id: patient.id,
  patientName: patient.fullName,
  identityNumber: patient.patientId,
  age: calculateAge(patient.dob || patient.dateOfBirth),
  contact: { phone: patient.phoneNumber || '', email: patient.email },
  assignedAssistantId: patient.assignedAssistantId,
  assignedAssistantName: patient.assignedAssistant
    ? `${patient.assignedAssistant.firstName} ${patient.assignedAssistant.lastName}`
    : undefined,
  isRegistrationComplete: patient.isRegistrationComplete,
  linked: patient.linked,
  emailVerified: patient.emailVerified,
  isActive: patient.isActive,
});

export const mapAssignedPatientsToAppointmentRows = (
  patients: AssignedPatient[]
): AppointmentRow[] => patients?.map(mapAssignedPatientToAppointmentRow);

export const toVerificationPatient = (
  patient: AssignedPatient | AppointmentRow
) => {
  if ('fullName' in patient) {
    return {
      id: patient.id,
      fullName: patient.fullName || patient.patientId || '',
      email: patient.email || '',
      linked: patient.linked,
    };
  }
  return {
    id: patient.id,
    fullName: patient.patientName,
    email: patient.contact?.email || '',
    linked: patient.linked,
  };
};

export const mapDoctorToClinician = (doctor: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  twoFactorEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}) => ({
  ...doctor,
  name: `${doctor.firstName} ${doctor.lastName}`.trim(),
});

export const mapDoctorsToClinicians = (
  doctors: Parameters<typeof mapDoctorToClinician>[0][]
) => doctors.map(mapDoctorToClinician);

export async function searchPatients(
  query: string,
  assignedPatients: AssignedPatient[]
): Promise<AssignedPatient[]> {
  if (!query || query.trim().length === 0) return [];
  const searchTerm = query.toLowerCase().trim();
  return assignedPatients?.filter(
    (patient) =>
      patient.fullName.toLowerCase().includes(searchTerm) ||
      patient.patientId.toLowerCase().includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm)
  );
}

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const formatDateOfBirth = (dob: string): string => {
  if (!dob) return '';
  try {
    const date = parseISO(dob);
    if (!isValid(date)) return dob;
    const day = date.getDate();
    const suffix =
      day % 10 === 1 && day !== 11
        ? 'st'
        : day % 10 === 2 && day !== 12
          ? 'nd'
          : day % 10 === 3 && day !== 13
            ? 'rd'
            : 'th';
    return `${day}${suffix} ${format(date, 'MMMM, yyyy')}`;
  } catch {
    return dob;
  }
};

export const genderMap: Record<string, 'Male' | 'Female' | 'Other'> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

export function generateBlobUrls(
  blobs: Record<string, { pdf?: Blob; original?: Blob }>
): Record<string, { pdfUrl?: string; originalUrl?: string }> {
  const urls: Record<string, { pdfUrl?: string; originalUrl?: string }> = {};
  for (const [section, { pdf, original }] of Object.entries(blobs)) {
    urls[section] = {};
    if (pdf instanceof Blob) urls[section].pdfUrl = URL.createObjectURL(pdf);
    if (original instanceof Blob)
      urls[section].originalUrl = URL.createObjectURL(original);
  }
  return urls;
}

export const handleApiError = (error: unknown) => {
  const err = error as {
    response?: {
      data?: {
        details?: { message?: string };
        error?: string;
        message?: string;
      };
    };
    message?: string;
  };
  const errorMessage =
    err?.response?.data?.details?.message ||
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    'An unexpected error occurred';
  toast.error(errorMessage);
};

export const formatPdfDate = (
  dateValue: Date | string | null | undefined
): string => {
  if (!dateValue) return '';
  let dateToFormat: Date;
  if (dateValue instanceof Date) dateToFormat = dateValue;
  else if (typeof dateValue === 'string') {
    const parsed = parseISO(dateValue);
    dateToFormat = isValid(parsed) ? parsed : new Date(dateValue);
  } else return '';
  return isValid(dateToFormat) ? format(dateToFormat, 'MM/dd/yyyy') : '';
};
