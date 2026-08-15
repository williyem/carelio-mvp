import { format } from 'date-fns';
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';

export function combineDateAndTime(date: string, time: string): string {
  if (!date || !time) return date;
  const datePart = date.slice(0, 10);
  const [hours, minutes] = time.split(':').map(Number);
  const year = Number(datePart.slice(0, 4));
  const month = Number(datePart.slice(5, 7)) - 1;
  const day = Number(datePart.slice(8, 10));
  return new Date(
    Date.UTC(year, month, day, hours || 0, minutes || 0, 0, 0)
  ).toISOString();
}

export function extractTimeFromDate(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().substring(11, 16); // HH:mm
}

export function getLocalDateString(dateInput?: string | Date): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  return (
    date.getFullYear() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0')
  );
}

export function extractLocalTimeFromDate(date: string): string {
  if (!date) return '';
  return format(new Date(date), 'HH:mm');
}

export function getTodayLocalDateString(): string {
  return getLocalDateString();
}

export function toLocalISOString(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
}

export function dateOnlyToLocalISOString(dateOnly: string): string {
  if (!dateOnly) return toLocalISOString(new Date());
  const [y, m, d] = dateOnly.split('-').map(Number);
  const now = new Date();
  const local = new Date(
    y,
    (m || 1) - 1,
    d || 1,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds()
  );
  return format(local, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
}

export function utcStringToLocalDate(utcString: string): Date {
  const year = parseInt(formatInTimeZone(utcString, 'UTC', 'yyyy'), 10);
  const month = parseInt(formatInTimeZone(utcString, 'UTC', 'MM'), 10) - 1;
  const day = parseInt(formatInTimeZone(utcString, 'UTC', 'dd'), 10);
  return new Date(year, month, day);
}

export function localDateToUtcString(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const utcDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  return utcDate.toISOString();
}

export function calculateAge(dob: string): number {
  if (!dob) return 0;

  try {
    const birthYear = parseInt(formatInTimeZone(dob, 'UTC', 'yyyy'), 10);
    const birthMonth = parseInt(formatInTimeZone(dob, 'UTC', 'MM'), 10);
    const birthDay = parseInt(formatInTimeZone(dob, 'UTC', 'dd'), 10);

    const today = new Date();
    const todayYear = today.getUTCFullYear();
    const todayMonth = today.getUTCMonth() + 1;
    const todayDay = today.getUTCDate();

    let age = todayYear - birthYear;
    const m = todayMonth - birthMonth;
    if (m < 0 || (m === 0 && todayDay < birthDay)) {
      age--;
    }
    return age;
  } catch {
    return 0;
  }
}

export function formatDOB(
  dob: string,
  formatString: string = 'MM/dd/yyyy'
): string {
  if (!dob) return 'N/A';

  try {
    return formatInTimeZone(dob, 'UTC', formatString);
  } catch {
    return 'N/A';
  }
}

export function getDayStartUtc(date: Date, timezone: string): Date {
  const localDate = toZonedTime(date, timezone);
  const startOfDay = new Date(localDate);
  startOfDay.setHours(0, 0, 0, 0);
  return fromZonedTime(startOfDay, timezone);
}

export function getDayEndUtc(date: Date, timezone: string): Date {
  const localDate = toZonedTime(date, timezone);
  const endOfDay = new Date(localDate);
  endOfDay.setHours(23, 59, 59, 999);
  return fromZonedTime(endOfDay, timezone);
}

export function formatAge(dob: string): string {
  if (!dob) return 'Age N/A';
  const age = calculateAge(dob);
  return `${age} Years`;
}

export const formatSessionDateRange = (start: string, end: string) => {
  if (!start || !end) return '';
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startValid = !Number.isNaN(startDate.getTime());
  const endValid = !Number.isNaN(endDate.getTime());
  if (!startValid || !endValid) return '';

  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth = startDate.getMonth() === endDate.getMonth() && sameYear;
  if (sameYear && sameMonth) {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`;
  } else if (sameYear) {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  } else {
    return `${format(startDate, 'MMM d, yyyy')} - ${format(
      endDate,
      'MMM d, yyyy'
    )}`;
  }
};

export const formatSessionTimeWindowLocal = (start: string, end: string) => {
  if (!start || !end) return '';
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startValid = !Number.isNaN(startDate.getTime());
  const endValid = !Number.isNaN(endDate.getTime());
  if (!startValid || !endValid) return '';
  return `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
};

export const formatDaysOfWeek = (days?: string[]) => {
  if (!Array.isArray(days) || days.length === 0) return 'All days';
  const short = days.map((d) => d.slice(0, 3));
  return short.join(', ');
};

export function getSessionStatus(session: {
  startDate: string;
  endDate: string;
}): 'future' | 'ongoing' | 'past' {
  const now = new Date();
  const start = new Date(session.startDate);
  const end = new Date(session.endDate);

  if (now < start) {
    return 'future';
  } else if (now >= start && now <= end) {
    return 'ongoing';
  } else {
    return 'past';
  }
}

type Session = {
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
};

export function isWithinScheduleRangeUtc(
  now: Date,
  startDate: string,
  endDate: string
): boolean {
  const s = new Date(startDate);
  const e = new Date(endDate);
  return now >= s && now <= e;
}

export function isTodayAllowedUtc(
  daysOfWeek?: string[],
  now: Date = new Date()
): boolean {
  if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) return true;
  const names = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return daysOfWeek.includes(names[now.getDay()]);
}

export function getDailyWindowUtc(
  now: Date,
  startDate: string,
  endDate: string
): { dailyStart: Date; dailyEnd: Date; overnight: boolean } {
  const s = new Date(startDate);
  const e = new Date(endDate);
  const startH = s.getHours();
  const startM = s.getMinutes();
  const endH = e.getHours();
  const endM = e.getMinutes();

  let y = now.getFullYear();
  let m = now.getMonth();
  let d = now.getDate();

  const isCrossover = endH < startH || (endH === startH && endM < startM);

  if (isCrossover) {
    const nowH = now.getHours();
    const nowM = now.getMinutes();

    if (nowH < startH || (nowH === startH && nowM < startM)) {
      const prevDay = new Date(now);
      prevDay.setDate(prevDay.getDate() - 1);
      y = prevDay.getFullYear();
      m = prevDay.getMonth();
      d = prevDay.getDate();
    }
  }

  const dailyStart = new Date(y, m, d, startH, startM);

  let dailyEnd: Date;
  if (isCrossover) {
    dailyEnd = new Date(y, m, d + 1, endH, endM);
  } else {
    dailyEnd = new Date(y, m, d, endH, endM);
  }

  return { dailyStart, dailyEnd, overnight: isCrossover };
}

export function isWithinDailyWindowUtc(
  now: Date,
  startDate: string,
  endDate: string
): boolean {
  const { dailyStart, dailyEnd } = getDailyWindowUtc(now, startDate, endDate);
  return now >= dailyStart && now <= dailyEnd;
}

export function isDisabledToday(session: Session): boolean {
  const now = new Date();
  if (!isWithinScheduleRangeUtc(now, session.startDate, session.endDate)) {
    return true;
  }
  if (!isTodayAllowedUtc(session.daysOfWeek, now)) {
    return true;
  }
  if (!isWithinDailyWindowUtc(now, session.startDate, session.endDate)) {
    return true;
  }
  return false;
}

export type SessionDisplayStatus =
  | 'future'
  | 'ongoing-available'
  | 'ongoing-unavailable'
  | 'past';

export function getSessionDisplayStatus(session: {
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
}): SessionDisplayStatus {
  const now = new Date();
  const start = new Date(session.startDate);
  const end = new Date(session.endDate);

  if (now < start) return 'future';
  if (now > end) return 'past';

  const allowedDay = isTodayAllowedUtc(session.daysOfWeek, now);
  const withinWindow = isWithinDailyWindowUtc(
    now,
    session.startDate,
    session.endDate
  );
  return allowedDay && withinWindow
    ? 'ongoing-available'
    : 'ongoing-unavailable';
}

export function getCheckInLabelUtc(
  session: Session,
  now: Date = new Date()
): string {
  if (!isWithinScheduleRangeUtc(now, session.startDate, session.endDate)) {
    const start = new Date(session.startDate);
    return now < start ? 'Not Started Yet' : 'Session Ended';
  }
  if (!isTodayAllowedUtc(session.daysOfWeek, now)) {
    return 'Unavailable Today';
  }
  if (!isWithinDailyWindowUtc(now, session.startDate, session.endDate)) {
    const { dailyStart } = getDailyWindowUtc(
      now,
      session.startDate,
      session.endDate
    );
    return now < dailyStart ? 'Not Started Yet' : 'Session Ended';
  }
  return 'Check In';
}

export function getSessionDateFromSchedule(schedule: {
  startDate: string;
  endDate: string;
}): string | undefined {
  if (!schedule.startDate || !schedule.endDate) {
    return undefined;
  }

  const startDate = new Date(schedule.startDate);
  const endDate = new Date(schedule.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return undefined;
  }

  const now = new Date();
  const { dailyStart } = getDailyWindowUtc(
    now,
    schedule.startDate,
    schedule.endDate
  );

  if (Number.isNaN(dailyStart.getTime())) {
    return undefined;
  }

  return dailyStart.toISOString();
}

export function isCheckInWithinScheduleWindowPlusHour(
  checkInTime: string,
  scheduleStartDate: string,
  scheduleEndDate: string
): boolean {
  const checkInDate = new Date(checkInTime);
  const { dailyStart, dailyEnd } = getDailyWindowUtc(
    checkInDate,
    scheduleStartDate,
    scheduleEndDate
  );

  const oneHourInMs = 60 * 60 * 1000;
  const extendedEnd = new Date(dailyEnd.getTime() + oneHourInMs);

  return checkInDate >= dailyStart && checkInDate <= extendedEnd;
}

export function canCheckoutCheckIn(
  checkInTime: string,
  scheduleStartDate: string,
  scheduleEndDate: string,
  now: Date = new Date()
): boolean {
  const checkInDate = new Date(checkInTime);
  const { dailyStart, dailyEnd } = getDailyWindowUtc(
    checkInDate,
    scheduleStartDate,
    scheduleEndDate
  );

  const oneHourInMs = 60 * 60 * 1000;
  const extendedEnd = new Date(dailyEnd.getTime() + oneHourInMs);

  return now >= dailyStart && now <= extendedEnd;
}

export function calculateGroupNoteTimeRemaining(
  sessionDate: string,
  status:
    | 'pending'
    | 'in_progress'
    | 'submitted'
    | 'completed'
    | 'expired'
    | 'missed'
    | 'reopened',
  now: Date = new Date(),
  reopenedAt?: string | null,
  gracePeriodException?: {
    signingDeadline: string;
  } | null
): string | null {
  if (
    status !== 'pending' &&
    status !== 'in_progress' &&
    status !== 'missed' &&
    status !== 'reopened'
  ) {
    return null;
  }

  let deadline: Date;

  if (gracePeriodException?.signingDeadline) {
    const exceptionDeadline = new Date(gracePeriodException.signingDeadline);
    if (exceptionDeadline.getTime() > now.getTime()) {
      deadline = exceptionDeadline;
    } else {
      return null;
    }
  } else {
    const baseDate =
      status === 'reopened' && reopenedAt ? reopenedAt : sessionDate;

    if (!baseDate) {
      return null;
    }

    const baseDateTime = new Date(baseDate);
    deadline = new Date(baseDateTime);
    deadline.setHours(deadline.getHours() + 72);
  }

  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) {
    return null;
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  parts.push(`${minutes}m`);

  return parts.join(' ');
}
