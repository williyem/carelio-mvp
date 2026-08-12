import { Appointment } from '@/integration/appointments';
import {
  Clinician,
  HealthAssistantResponse,
} from '@/integration/health-assistant/types';
import {
  BloodPressureReading,
  GlucoseReading,
  PulseOxReading,
  ThermometerReading,
  Vital,
  WeightScaleReading,
} from '@/types/vitals.types';
import { format, parseISO } from 'date-fns';

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

/**
 * Format appointment date from ISO string (e.g., "2026-01-29T09:00:15.201Z" → "Jan 29, 2026")
 */
export const formatAppointmentDate = (startTime: string): string => {
  if (!startTime) return '';

  try {
    const date = new Date(startTime);
    if (isNaN(date.getTime())) return '';

    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.warn('Failed to format appointment date:', error);
    return '';
  }
};

/**
 * Format appointment time range (e.g., "9:00 AM - 10:00 AM")
 */
export const formatAppointmentTimeRange = (
  startTime: string,
  endTime: string
): string => {
  if (!startTime || !endTime) return '';

  try {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return '';

    const startFormatted = format(startDate, 'h:mm a');
    const endFormatted = format(endDate, 'h:mm a');

    return `${startFormatted} - ${endFormatted}`;
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
  now: Date = new Date()
): boolean => {
  if (!startTime || !endTime) return false;
  if (
    status?.toLowerCase() === 'completed' ||
    status?.toLowerCase() === 'cancelled'
  ) {
    return false;
  }

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
    return format(date, 'h:mm a');
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
      const startHour = start.getHours();
      minHour = Math.min(minHour, startHour);
      // Ensure we show at least the hour the appointment starts in
      maxHour = Math.max(maxHour, startHour);

      if (apt.endTime) {
        const end = parseISO(apt.endTime);
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
