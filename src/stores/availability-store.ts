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
  days: Partial<Record<DayName, TimeRange[]>>;
}

const DEFAULT_WEEKDAY_RANGE: TimeRange[] = [{ start: '09:00', end: '17:00' }];

export const defaultAvailability = (): DoctorAvailability => ({
  enabled: true,
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
