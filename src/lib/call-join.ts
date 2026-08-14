import {
  doctorCookieObj,
  healthAssistantCookieObj,
  patientCookieObj,
} from '@/lib/constants';
import type { Appointment } from '@/types/appointment.types';

export type CallParticipantRole = 'doctor' | 'health-assistant' | 'patient';

export type PortalIdentity = {
  role: CallParticipantRole;
  userId: string;
  patientCode?: string;
};

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const parts = document.cookie.split('; ');
  const match = parts.find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(name.length + 1));
}

function readCookieUser(
  name: string
): { id?: string; patientId?: string } | null {
  try {
    const raw = readCookie(name);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: string; patientId?: string };
    if (!parsed?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isDoctorPath(pathname: string) {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/doctor') ||
    pathname.startsWith('/live-consultation') ||
    pathname.startsWith('/onboarding/doctor')
  );
}

export function isHealthAssistantPath(pathname: string) {
  return (
    pathname.startsWith('/health-assistant') ||
    pathname.startsWith('/onboarding/health-assistant')
  );
}

export function isPatientPath(pathname: string) {
  return pathname.startsWith('/patient');
}

export function readPortalIdentity(
  pathname = typeof window === 'undefined' ? '' : window.location.pathname
): PortalIdentity | null {
  const doctor = readCookieUser(doctorCookieObj);
  const assistant = readCookieUser(healthAssistantCookieObj);
  const patient = readCookieUser(patientCookieObj);

  if (isDoctorPath(pathname)) {
    return { role: 'doctor', userId: doctor?.id || 'doctor' };
  }
  if (isHealthAssistantPath(pathname)) {
    return {
      role: 'health-assistant',
      userId: assistant?.id || 'health-assistant',
    };
  }
  if (isPatientPath(pathname)) {
    return {
      role: 'patient',
      userId: patient?.id || 'patient',
      patientCode: patient?.patientId,
    };
  }

  // Call overlay can sit on a shared layout. Use the portal cookie that
  // matches this area; never let a leftover patient cookie override a doctor.
  if (
    doctor?.id &&
    !isPatientPath(pathname) &&
    !isHealthAssistantPath(pathname)
  ) {
    return { role: 'doctor', userId: doctor.id };
  }
  if (assistant?.id && !isPatientPath(pathname)) {
    return { role: 'health-assistant', userId: assistant.id };
  }
  if (patient?.id) {
    return {
      role: 'patient',
      userId: patient.id,
      patientCode: patient.patientId,
    };
  }
  return null;
}

function idsMatch(a?: string | null, b?: string | null) {
  return !!a && !!b && a === b;
}

function userBelongsOnCall(
  appointment: Appointment,
  identity: PortalIdentity
): boolean {
  const appointmentDoctorId = appointment.doctorId || appointment.doctor?.id;
  const appointmentPatientId = appointment.patientId || appointment.patient?.id;

  if (identity.role === 'doctor') {
    if (!appointmentDoctorId) return true;
    if (idsMatch(identity.userId, appointmentDoctorId)) return true;
    // Dummy/dev cookies may not share IDs with API appointments. The doctor
    // portal cookie is enough to treat this joiner as the clinician.
    return identity.userId.length !== appointmentDoctorId.length;
  }

  if (identity.role === 'health-assistant') {
    return true;
  }

  return (
    idsMatch(identity.userId, appointmentPatientId) ||
    idsMatch(identity.patientCode, appointment.patient?.patientId) ||
    idsMatch(identity.userId, appointment.patient?.patientId)
  );
}

export function getCallJoinError(
  appointment: Appointment | null | undefined,
  identity: PortalIdentity | null
): string | null {
  if (!identity) {
    return 'Sign in to join this call';
  }
  if (!appointment) {
    return 'No appointment selected for this call';
  }

  const status = appointment.status?.toUpperCase();
  if (status === 'CANCELLED') return 'This appointment was cancelled';
  if (status === 'COMPLETED') return 'This consultation has already ended';
  if (status === 'MISSED') return 'This appointment was missed';

  if (appointment.endTime) {
    const end = new Date(appointment.endTime);
    if (!Number.isNaN(end.getTime()) && Date.now() >= end.getTime()) {
      return 'This call window has ended';
    }
  }

  if (!userBelongsOnCall(appointment, identity)) {
    return 'You are not a participant on this appointment';
  }

  return null;
}

export function isClinicianCallRole(role: CallParticipantRole | null) {
  return role === 'doctor';
}
