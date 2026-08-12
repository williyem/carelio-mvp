'use client';

import * as React from 'react';
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import type { Appointment } from '@/integration/appointments/types';
import { calculateDuration, getDynamicWorkingHours } from '@/lib/easy';
import { EventCard } from './event-card';

export function WeekView({
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
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Get dynamic hours for the entire week
  const weekAppointments = appointments.filter((apt) => {
    if (!apt.startTime) return false;
    try {
      const aptDate = parseISO(apt.startTime);
      return (
        aptDate >= days[0] && aptDate <= addDays(days[days.length - 1], 1) // cover the full week
      );
    } catch {
      return false;
    }
  });
  const { hours, minHour } = getDynamicWorkingHours(weekAppointments);
  const rowHeight = 64;

  // Live current-time indicator
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const maxHour = minHour + hours.length;
  const currentHour = now.getHours();
  const timeLineInRange = currentHour >= minHour && currentHour < maxHour;
  const timeLineTop = timeLineInRange
    ? (((currentHour - minHour) * 60 + now.getMinutes()) / 60) * rowHeight
    : null;

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="flex border-b">
          <div className="w-24 shrink-0 bg-gray-50 border-r"></div>
          {days.map((day, i) => (
            <div
              key={i}
              className="flex-1 py-3 px-4 text-sm font-medium text-gray-900 border-r last:border-r-0 bg-gray-50"
            >
              {format(day, 'd EEE')}
            </div>
          ))}
        </div>

        {/* Grid Container */}
        <div className="relative flex">
          {/* Time gutter labels */}
          <div className="w-24 shrink-0 bg-gray-50 border-r">
            {hours.map((time, index) => (
              <div
                key={`${time}-${index}`}
                className="h-16 flex justify-center py-2 text-xs font-medium text-gray-500 border-b last:border-b-0 bg-gray-50/30"
              >
                {time}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, j) => {
            const statusPriority: Record<string, number> = {
              CANCELLED: 0,
              MISSED: 1,
              PENDING_CONFIRMATION: 2,
              COMPLETED: 3,
              CONFIRMED: 4,
            };

            const dayAppointments = appointments
              .filter((apt) => {
                if (!apt.startTime || !apt.endTime) return false;
                try {
                  return isSameDay(parseISO(apt.startTime), day);
                } catch {
                  return false;
                }
              })
              .sort((a, b) => {
                const priorityA = statusPriority[a.status] ?? 0;
                const priorityB = statusPriority[b.status] ?? 0;
                return priorityA - priorityB;
              });

            // rowHeight defined above

            return (
              <div
                key={j}
                className="flex-1 border-r last:border-r-0 relative bg-[#F9FBFC]"
              >
                {/* Visual grid lines */}
                {hours.map((time, index) => (
                  <div
                    key={`${time}-${index}`}
                    className="h-16 border-b last:border-b-0"
                  />
                ))}

                {/* Current time indicator — only on today's column (rendered behind events) */}
                {isToday(day) && timeLineTop !== null && (
                  <div
                    className="absolute left-0 right-0 flex items-center pointer-events-none"
                    style={{ top: `${timeLineTop}px` }}
                  >
                    <div className="flex-1 h-[5px] bg-[#10B121]" />
                  </div>
                )}

                {/* Appointments Overlay */}
                <div className="absolute inset-0 pointer-events-none p-1">
                  {dayAppointments.map((apt) => {
                    const start = parseISO(apt.startTime!);
                    const duration = calculateDuration(
                      apt.startTime,
                      apt.endTime
                    );
                    // Snap minutes to the nearest 30-minute floor for visual alignment
                    const snappedMinutes =
                      Math.floor(start.getMinutes() / 30) * 30;
                    const minutesFromStart =
                      (start.getHours() - minHour) * 60 + snappedMinutes;
                    const top = (minutesFromStart / 60) * rowHeight;
                    const height = (duration / 60) * rowHeight;

                    return (
                      <div
                        key={apt.id}
                        className="absolute left-1 right-1 pointer-events-auto"
                        style={{
                          top: `${top + 4}px`, // +4 for padding
                          height: `${height - 8}px`, // -8 for padding
                          minHeight: '30px',
                        }}
                      >
                        <EventCard
                          appointment={apt}
                          variant="blue"
                          className="h-full"
                          onReschedule={onReschedule}
                          onCancel={onCancel}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
