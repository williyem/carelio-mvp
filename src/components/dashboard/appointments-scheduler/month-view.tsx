'use client';

import * as React from 'react';
import {
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Appointment } from '@/integration/appointments/types';
import { formatTimeFromISO } from '@/lib/easy';
import { AppointmentDetailsPopup } from './appointment-details-popup';

export function MonthView({
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
  const [openAptId, setOpenAptId] = React.useState<string | null>(null);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the start to align with week days
  const startPadding = getDay(monthStart);
  const paddedDays: (Date | null)[] = [
    ...Array(startPadding).fill(null),
    ...allDays,
  ];
  // Pad end to complete the grid
  while (paddedDays.length % 7 !== 0) {
    paddedDays.push(null);
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((d) => (
            <div
              key={d}
              className="p-4 text-sm font-semibold text-gray-900 border-r last:border-r-0 bg-gray-50"
            >
              {d}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div className="grid grid-cols-7 auto-rows-[120px]">
          {paddedDays.map((day, i) => {
            const dayAppointments = day
              ? appointments
                  .filter((apt) => {
                    if (!apt.startTime) return false;
                    try {
                      return isSameDay(parseISO(apt.startTime), day);
                    } catch {
                      return false;
                    }
                  })
                  .sort((a, b) => {
                    const statusPriority: Record<string, number> = {
                      CANCELLED: 0,
                      MISSED: 1,
                      PENDING_CONFIRMATION: 2,
                      COMPLETED: 3,
                      CONFIRMED: 4,
                    };
                    const priorityA = statusPriority[a.status] ?? 0;
                    const priorityB = statusPriority[b.status] ?? 0;
                    return priorityB - priorityA; // Descending for Month list to show most important first
                  })
              : [];

            return (
              <div
                key={i}
                className="border-b border-r p-2 relative hover:bg-gray-50/30 transition-colors"
              >
                {day && (
                  <>
                    <span className="absolute top-2 right-3 text-sm text-gray-500 font-medium">
                      {format(day, 'd')}
                    </span>

                    <div className="mt-6 space-y-1">
                      {dayAppointments.slice(0, 2).map((apt) => (
                        <Popover
                          key={apt.id}
                          open={openAptId === apt.id}
                          onOpenChange={(open) =>
                            setOpenAptId(open ? apt.id : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <div className="bg-blue-50 text-brand-blue text-[10px] md:text-xs p-1.5 rounded font-medium truncate flex items-center gap-1 cursor-pointer hover:bg-blue-100 transition-colors">
                              <span className="shrink-0">
                                {formatTimeFromISO(apt.startTime)}
                              </span>
                              <span className="truncate">
                                {apt.patient?.fullName ||
                                  apt.patient?.patientId ||
                                  'Patient'}
                              </span>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent
                            className="p-0 border-none shadow-none w-auto overflow-visible"
                            side="top"
                            align="center"
                          >
                            <AppointmentDetailsPopup
                              appointment={apt}
                              onAction={() => setOpenAptId(null)}
                              onReschedule={onReschedule}
                              onCancel={onCancel}
                            />
                          </PopoverContent>
                        </Popover>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-gray-500 font-medium">
                          +{dayAppointments.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
