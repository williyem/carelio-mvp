'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type DayName = (typeof DAYS_OF_WEEK)[number];

export interface TimeRange {
  start: string;
  end: string;
}

export interface DoctorAvailability {
  enabled: boolean;
  timezone?: string;
  days: Partial<Record<DayName, TimeRange[]>>;
}

const DEFAULT_WEEKDAY_RANGE: TimeRange[] = [{ start: '09:00', end: '17:00' }];

export const defaultAvailability = (): DoctorAvailability => ({
  enabled: true,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Accra',
  days: {
    Monday: DEFAULT_WEEKDAY_RANGE,
    Tuesday: DEFAULT_WEEKDAY_RANGE,
    Wednesday: DEFAULT_WEEKDAY_RANGE,
    Thursday: DEFAULT_WEEKDAY_RANGE,
    Friday: DEFAULT_WEEKDAY_RANGE,
  },
});

interface AvailabilityState {
  byDoctorId: Record<string, DoctorAvailability>;
  getAvailability: (doctorId: string) => DoctorAvailability;
  setAvailability: (doctorId: string, value: DoctorAvailability) => void;
}

export const useAvailabilityStore = create<AvailabilityState>()(
  persist(
    (set, get) => ({
      byDoctorId: {},
      getAvailability: (doctorId) =>
        get().byDoctorId[doctorId] ?? defaultAvailability(),
      setAvailability: (doctorId, value) =>
        set((state) => ({
          byDoctorId: { ...state.byDoctorId, [doctorId]: value },
        })),
    }),
    { name: 'carelio.availability' }
  )
);

export function isTimeWithinRanges(time: string, ranges: TimeRange[]): boolean {
  const [hours, minutes] = time.split(':').map(Number);
  const value = hours * 60 + minutes;
  return ranges.some((range) => {
    const [startH, startM] = range.start.split(':').map(Number);
    const [endH, endM] = range.end.split(':').map(Number);
    return value >= startH * 60 + startM && value < endH * 60 + endM;
  });
}

export function getRangesForDate(
  availability: DoctorAvailability,
  date: Date
): TimeRange[] | null {
  if (!availability.enabled) return null;
  const day = DAYS_OF_WEEK[date.getDay()];
  const ranges = availability.days[day];
  if (!ranges || ranges.length === 0) return [];
  return ranges;
}

export interface HourSlot {
  start: string;
  end: string;
  label: string;
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function fromMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function format12Hour(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function formatSlotLabel(start: string, end: string): string {
  return `${format12Hour(start)} - ${format12Hour(end)}`;
}

export function splitRangesIntoHourSlots(
  ranges: TimeRange[] | null | undefined
): HourSlot[] {
  if (!ranges || ranges.length === 0) return [];
  const slots: HourSlot[] = [];
  for (const range of ranges) {
    let start = toMinutes(range.start);
    const end = toMinutes(range.end);
    while (start + 60 <= end) {
      const slotStart = fromMinutes(start);
      const slotEnd = fromMinutes(start + 60);
      slots.push({
        start: slotStart,
        end: slotEnd,
        label: formatSlotLabel(slotStart, slotEnd),
      });
      start += 60;
    }
  }
  return slots;
}

export function formatTimezoneCaption(timeZone?: string): string {
  const tz =
    timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  try {
    const now = new Date();
    const longName = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'long',
    })
      .formatToParts(now)
      .find((part) => part.type === 'timeZoneName')?.value;
    const shortName = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
    })
      .formatToParts(now)
      .find((part) => part.type === 'timeZoneName')?.value;
    if (longName && shortName && longName !== shortName) {
      return `All times are displayed in ${longName} (${shortName})`;
    }
    return `All times are displayed in ${longName || tz}`;
  } catch {
    return `All times are displayed in ${tz}`;
  }
}
