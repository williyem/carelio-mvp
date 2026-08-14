'use client';

import * as React from 'react';
import { isSameDay, isToday, parseISO } from 'date-fns';
import type { Appointment } from '@/integration/appointments/types';
import { calculateDuration, getDynamicWorkingHours } from '@/lib/easy';
import { TimeLabel, EventCard } from './event-card';
import { APPOINTMENT_STATUS_PRIORITY } from '@/lib/appointment-status';

export function DayView({
  appointments,
  selectedDate,
  onReschedule,
  onCancel,
}: {
  appointments: Appointment[];
  selectedDate: Date;
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
}) {
  // Filter and sort appointments for today
  const todayAppointments = appointments
    .filter((apt) => {
      if (!apt.startTime) return false;
      try {
        return isSameDay(parseISO(apt.startTime), selectedDate);
      } catch {
        return false;
      }
    })
    .sort((a, b) => {
      const priorityA = APPOINTMENT_STATUS_PRIORITY[a.status] ?? 0;
      const priorityB = APPOINTMENT_STATUS_PRIORITY[b.status] ?? 0;
      return priorityA - priorityB;
    });

  // Filter out cancelled appointments if a non-cancelled one exists at the same time
  const visibleAppointments = todayAppointments.filter((apt) => {
    if (apt.status?.toUpperCase() !== 'CANCELLED') return true;

    return !todayAppointments.some(
      (other) =>
        other.id !== apt.id &&
        other.status?.toUpperCase() !== 'CANCELLED' &&
        parseISO(other.startTime!).getTime() ===
          parseISO(apt.startTime!).getTime()
    );
  });

  const { hours, minHour } = getDynamicWorkingHours(visibleAppointments);
  const rowHeight = 80; // h-20 = 5rem = 80px

  // Live current-time indicator
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const showTimeLine = isToday(selectedDate);
  const maxHour = minHour + hours.length;
  const currentHour = now.getHours();
  const timeLineVisible =
    showTimeLine && currentHour >= minHour && currentHour < maxHour;
  const timeLineTop = timeLineVisible
    ? (((currentHour - minHour) * 60 + now.getMinutes()) / 60) * rowHeight
    : null;

  return (
    <div className="relative divide-y divide-[#E4E6E7]">
      {hours.map((time, index) => (
        <div key={`${time}-${index}`} className="flex h-20">
          <TimeLabel time={time} />
          <div className="flex-1 bg-[#F9FBFC] relative" />
        </div>
      ))}
      {/* Overlay for appointments */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="flex h-full">
          <div className="w-24 shrink-0" /> {/* Spacer for TimeLabel */}
          <div className="flex-1 relative h-full">
            {/* Current time indicator - rendered behind events */}
            {timeLineVisible && timeLineTop !== null && (
              <div
                className="absolute left-0 right-0 flex items-center pointer-events-none"
                style={{ top: `${timeLineTop}px` }}
              >
                <div className="flex-1 h-[5px] bg-[#10B121]" />
              </div>
            )}

            {visibleAppointments.map((apt) => {
              if (!apt.startTime || !apt.endTime) return null;
              const start = parseISO(apt.startTime);
              const duration = calculateDuration(apt.startTime, apt.endTime);
              // Snap minutes to the nearest 30-minute floor for visual alignment
              const snappedMinutes = Math.floor(start.getMinutes() / 30) * 30;
              const minutesFromStart =
                (start.getHours() - minHour) * 60 + snappedMinutes;
              const top = (minutesFromStart / 60) * rowHeight;
              const height = (duration / 60) * rowHeight;

              return (
                <div
                  key={apt.id}
                  className="absolute left-2 right-2 pointer-events-auto"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    minHeight: '40px',
                  }}
                >
                  <EventCard
                    appointment={apt}
                    variant="default"
                    className="h-full"
                    onReschedule={onReschedule}
                    onCancel={onCancel}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
