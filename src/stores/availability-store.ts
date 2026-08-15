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

const weekdayHours = (): TimeRange[] => [{ start: '09:00', end: '17:00' }];

function toHhMm(value: string): string {
  return value.slice(0, 5);
}

export function fullWeekDays(
  days: Partial<Record<DayName, TimeRange[]>> = {}
): Record<DayName, TimeRange[]> {
  return Object.fromEntries(
    DAYS_OF_WEEK.map((day) => [
      day,
      days[day]?.map((range) => ({
        start: toHhMm(range.start),
        end: toHhMm(range.end),
      })) ?? [],
    ])
  ) as Record<DayName, TimeRange[]>;
}

export const defaultAvailability = (): DoctorAvailability => ({
  enabled: true,
  timezone: 'GMT',
  days: fullWeekDays({
    Monday: weekdayHours(),
    Tuesday: weekdayHours(),
    Wednesday: weekdayHours(),
    Thursday: weekdayHours(),
    Friday: weekdayHours(),
    Saturday: [],
    Sunday: [],
  }),
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

export function isClosedCalendarDay(
  availability: DoctorAvailability | undefined,
  date: Date
): boolean {
  if (!availability?.enabled) return false;
  const day = DAYS_OF_WEEK[date.getDay()];
  return (availability.days[day]?.length ?? 0) === 0;
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

export function formatTimezoneCaption(_timeZone?: string): string {
  return 'All times are in GMT';
}
