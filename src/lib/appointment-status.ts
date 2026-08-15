const ACTIVE_STATUSES = new Set([
  'CONFIRMED',
  'PENDING_CONFIRMATION',
  'IN_PROGRESS',
]);

export const APPOINTMENT_STATUS_PRIORITY: Record<string, number> = {
  CANCELLED: 0,
  MISSED: 1,
  PENDING_CONFIRMATION: 2,
  COMPLETED: 3,
  CONFIRMED: 4,
  IN_PROGRESS: 5,
};

function parseTime(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isUpcomingAppointment(
  appointment: { status?: string; startTime?: string; endTime?: string },
  now: Date = new Date()
): boolean {
  if (!appointment.status || !ACTIVE_STATUSES.has(appointment.status)) {
    return false;
  }

  const end = parseTime(appointment.endTime);
  if (end) return now < end;

  const start = parseTime(appointment.startTime);
  if (start) return now < start;

  return false;
}

export function isOngoingAppointment(
  appointment: { status?: string; startTime?: string; endTime?: string },
  now: Date = new Date()
): boolean {
  if (
    appointment.status !== 'IN_PROGRESS' &&
    appointment.status !== 'CONFIRMED' &&
    appointment.status !== 'PENDING_CONFIRMATION'
  ) {
    return false;
  }

  const start = parseTime(appointment.startTime);
  const end = parseTime(appointment.endTime);
  if (!start || !end) return appointment.status === 'IN_PROGRESS';

  return now >= start && now < end;
}
