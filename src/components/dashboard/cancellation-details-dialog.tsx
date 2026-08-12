'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Appointment } from '@/types/appointment.types';
import { formatAppointmentDate, formatAppointmentTimeRange } from '@/lib/easy';
import CalendarSvg from '@/assets/icons/calendar-svg';
import ClockSvg from '@/assets/icons/clock-svg';

interface CancellationDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

const CancellationDetailsDialog = ({
  isOpen,
  onOpenChange,
  appointment,
}: CancellationDetailsDialogProps) => {
  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-[30px] p-6 max-w-[443px] w-full">
        <DialogHeader>
          <DialogTitle className=" font-bold">Cancellation Detail</DialogTitle>
          <DialogDescription className="sr-only">
            Details about the cancelled appointment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 items-center gap-4 py-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-x-1">
              <CalendarSvg />
              <span className="text-sm font-normal text-(--text-secondary)">
                Schedule Date
              </span>
            </div>
            <span className="text-base  text-foreground font-bold">
              {formatAppointmentDate(appointment.startTime)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-x-1">
              <ClockSvg />
              <span className="text-sm font-normal text-(--text-secondary)">
                Schedule Time
              </span>
            </div>
            <span className="text-base  text-foreground font-bold">
              {formatAppointmentTimeRange(
                appointment.startTime,
                appointment.endTime
              )}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-normal text-(--text-secondary)">
              Cancelled By
            </span>
            <span className="text-base font-bold text-foreground capitalize">
              {/* todo: replace with actual name */}
              {/* {appointment.cancelledBy || 'N/A'} */}
              {'N/A'}
            </span>
          </div>
          <div className="flex col-span-2 p-2 rounded-[8px] bg-[#EBF8FF] flex-col gap-1">
            <span className="text-xs font-normal text-[#1792E6]">Reason</span>
            <span className="  text-primary text-xs">
              {appointment.cancellationReason || 'No reason provided'}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancellationDetailsDialog;
