'use client';

import * as React from 'react';
import { Clock, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Appointment } from '@/integration/appointments/types';
import {
  formatTimeFromISO,
  calculateDuration,
  formatDuration,
} from '@/lib/easy';
import { AppointmentDetailsPopup } from './appointment-details-popup';

export function TimeLabel({ time }: { time: string }) {
  return (
    <div className="w-24 shrink-0 flex justify-center pt-3 text-xs font-medium text-gray-500 bg-gray-50/30">
      {time}
    </div>
  );
}

interface EventCardProps extends React.HTMLAttributes<HTMLDivElement> {
  appointment: Appointment;
  variant?: 'default' | 'blue';
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
}

export function EventCard({
  appointment,
  variant = 'default',
  className,
  onReschedule,
  onCancel,
  ...props
}: EventCardProps) {
  const isCancelled = appointment.status?.toUpperCase() === 'CANCELLED';
  const cancellationReason = appointment.cancellationReason || '';
  const [isOpen, setIsOpen] = React.useState(false);
  const timeRange = formatTimeFromISO(appointment.startTime);
  const duration = calculateDuration(
    appointment.startTime,
    appointment.endTime
  );
  const durationStr = formatDuration(duration);
  const patientName =
    appointment.patient?.fullName ||
    appointment.patient?.patientId ||
    'Patient';

  const cardContent =
    variant === 'blue' ? (
      <div
        className={cn(
          ' border-t-2  p-2 sm:p-2 py-1 flex flex-col justify-start cursor-pointer  transition-colors rounded-sm overflow-hidden h-full',
          isCancelled
            ? 'bg-[#FCE8E8] border-[#FB2C2A]'
            : 'border-brand-blue/20 bg-[#E0F2FE] hover:bg-[#BAE6FD]',
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-1 mb-1">
          <div
            className={cn(
              'flex flex-wrap items-center gap-x-1 text-[10px] font-semibold ',
              isCancelled ? 'text-red-600 line-through' : 'text-brand-blue/80'
            )}
          >
            <span>{timeRange}</span>
            {durationStr && <span>({durationStr})</span>}
          </div>
          <Video
            className={cn(
              'h-3 w-3 text-brand-blue shrink-0 mt-0.5',
              isCancelled ? 'text-red-600' : ''
            )}
          />
        </div>
        <span className="text-[11px] sm:text-xs font-bold text-brand-blue line-clamp-2 leading-tight">
          {patientName}
        </span>
      </div>
    ) : (
      <div
        className={cn(
          isCancelled
            ? 'bg-[#FCE8E8] border-[#FB2C2A]'
            : 'bg-[#E8F4FD] hover:bg-brand-blue/15 border-brand-blue ',
          ' border-l-4 rounded-r-md p-3 flex flex-col justify-center cursor-pointer  transition-colors z-10 w-full h-full',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={cn(
              'text-xs font-bold text-brand-blue',
              isCancelled ? 'text-red-600 line-through' : 'text-brand-blue'
            )}
          >
            {timeRange} {durationStr && `(${durationStr})`}
          </span>
          <Clock
            className={cn(
              'h-3 w-3 text-brand-blue',
              isCancelled ? 'text-red-600 line-through' : 'text-brand-blue'
            )}
          />
        </div>

        <span
          className={cn(
            'text-sm font-semibold ',
            isCancelled ? 'text-brand-blue' : 'text-brand-blue'
          )}
        >
          {patientName}
        </span>
        {isCancelled ? (
          <span className="text-xs font-normal py-[6px] bg-white text-brand-blue">
            {cancellationReason}
          </span>
        ) : null}
      </div>
    );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{cardContent}</PopoverTrigger>
      <PopoverContent
        className="p-0 border-none shadow-none w-auto overflow-visible"
        side="top"
        align="center"
        sideOffset={10}
      >
        <AppointmentDetailsPopup
          appointment={appointment}
          onAction={() => setIsOpen(false)}
          onReschedule={onReschedule}
          onCancel={onCancel}
        />
      </PopoverContent>
    </Popover>
  );
}
