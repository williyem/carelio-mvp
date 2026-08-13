'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  User,
  ContactIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO, isAfter, isBefore, subMinutes } from 'date-fns';
import type { Appointment } from '@/integration/appointments/types';
import { useVideoCallStore } from '@/stores/video-call-store';
import Link from 'next/link';
import { Patient } from '@/types/patient.types';
import {
  formatTimeFromISO,
  calculateDuration,
  formatDuration,
} from '@/lib/easy';
import { cn } from '@/lib/utils';

export function AppointmentDetailsPopup({
  appointment,
  onAction,
  onReschedule,
  onCancel,
}: {
  appointment: Appointment;
  onAction?: () => void;
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
}) {
  const { startCall, setSelectedAppointment } = useVideoCallStore();
  const patientContact =
    appointment.patient?.email || appointment.patient?.phoneNumber;

  const patientName =
    appointment.patient?.fullName || appointment.patient?.patientId;
  const dateStr = appointment.startTime
    ? format(parseISO(appointment.startTime), 'MMM d, yyyy')
    : 'N/A';
  const timeStr = formatTimeFromISO(appointment.startTime);
  const duration = calculateDuration(
    appointment.startTime,
    appointment.endTime
  );
  const durationStr = formatDuration(duration);

  const now = new Date();
  const startObj = appointment.startTime
    ? parseISO(appointment.startTime)
    : null;
  const endObj = appointment.endTime ? parseISO(appointment.endTime) : null;

  const canStart = (() => {
    if (
      !startObj ||
      !endObj ||
      appointment.status === 'CANCELLED' ||
      appointment.status === 'COMPLETED'
    )
      return false;
    const fiveMinsBefore = subMinutes(startObj, 5);
    return (
      (now >= fiveMinsBefore || isAfter(now, fiveMinsBefore)) &&
      (now <= endObj || isBefore(now, endObj))
    );
  })();

  const canCancel = (() => {
    if (
      !endObj ||
      appointment.status === 'CANCELLED' ||
      appointment.status === 'COMPLETED'
    )
      return false;
    return isBefore(now, endObj);
  })();

  const canReschedule =
    appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED';

  const handleStartCall = () => {
    if (appointment.patient) {
      startCall(appointment.patient as unknown as Patient);
      setSelectedAppointment(
        appointment,
        appointment.patient as unknown as Patient
      );
      onAction?.();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100/50 p-6 w-[280px] flex flex-col items-start text-left space-y-5 animate-in fade-in zoom-in duration-200">
      <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
        <User className="h-7 w-7 text-gray-400" strokeWidth={1.5} />
      </div>

      <div className="space-y-4 w-full">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-y-1">
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {patientName}
            </h3>
            {!appointment.patient?.isRegistrationComplete && (
              <p className="text-[12px] block text-red-600">
                Registration Incomplete
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {appointment.status === 'CANCELLED' && (
              <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">
                Cancelled
              </span>
            )}
            {appointment.status === 'COMPLETED' && (
              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase">
                Completed
              </span>
            )}
            {(appointment.status === 'CONFIRMED' ||
              appointment.status === 'PENDING_CONFIRMATION') && (
              <span
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase',
                  startObj && isBefore(now, startObj)
                    ? 'bg-blue-50 text-brand-blue'
                    : 'bg-emerald-50 text-emerald-600 hidden'
                )}
              >
                {startObj && isBefore(now, startObj) ? 'Upcoming' : 'Confirmed'}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-gray-500 font-medium">
            <CalendarIcon className="h-5 w-5 opacity-70" />
            <span className="text-[15px]">{dateStr}</span>
          </div>
          {patientContact ? (
            <div className="flex items-center gap-3 text-gray-500 font-medium">
              <ContactIcon className="h-5 w-5 opacity-70" />
              <span className="text-[15px]">{patientContact}</span>
            </div>
          ) : null}
          <div className="flex items-center gap-3 text-gray-500 font-medium">
            <Clock className="h-5 w-5 opacity-70" />
            <span className="text-[15px]">
              {timeStr} {durationStr && `(${durationStr})`}
            </span>
          </div>
          {appointment.status?.toUpperCase() === 'CANCELLED' &&
            appointment.cancellationReason && (
              <div className="text-sm text-gray-500 mt-2 bg-red-50/50 p-2 rounded-lg border border-red-100/50">
                <span className="font-semibold text-red-700">
                  Cancellation Reason:
                </span>{' '}
                <p className="mt-1 text-gray-700 italic">
                  &ldquo;{appointment.cancellationReason}&rdquo;
                </p>
              </div>
            )}
          {appointment.reschedulingReason &&
            appointment.status?.toUpperCase() !== 'CANCELLED' && (
              <div className="text-sm text-gray-500 mt-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                <span className="font-semibold text-brand-blue">
                  Reschedule Reason:
                </span>{' '}
                <p className="mt-1 text-gray-700 italic">
                  &ldquo;{appointment.reschedulingReason}&rdquo;
                </p>
              </div>
            )}
        </div>
      </div>

      <div className="w-full space-y-2">
        {appointment.status === 'COMPLETED' && (
          <Link
            href={`/dashboard/patient/${appointment.patient?.id}/${appointment.id}`}
            className="w-full"
          >
            <Button
              className="w-full border-brand-blue text-brand-blue hover:text-white hover:bg-brand-blue rounded-xl h-14 font-semibold text-lg"
              variant="outline"
            >
              View Summary
            </Button>
          </Link>
        )}

        {appointment.status !== 'CANCELLED' &&
          appointment.status !== 'COMPLETED' && (
            <>
              {canStart && appointment.patient?.isRegistrationComplete && (
                <Button
                  onClick={handleStartCall}
                  disabled={!appointment.patient?.isRegistrationComplete}
                  className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl h-10 gap-3 text-sm font-normal"
                >
                  <Video className="h-6 w-6" />
                  Start Now
                </Button>
              )}

              <div className="flex gap-2 w-full">
                {canReschedule && (
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl font-normal h-10 text-sm"
                    onClick={() => {
                      onAction?.();
                      onReschedule?.(appointment);
                    }}
                  >
                    Reschedule
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-100 hover:text-red-600/80 h-10 hover:bg-red-50 rounded-xl font-normal text-sm"
                    onClick={() => {
                      onAction?.();
                      onCancel?.(appointment);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </>
          )}
      </div>
    </div>
  );
}
