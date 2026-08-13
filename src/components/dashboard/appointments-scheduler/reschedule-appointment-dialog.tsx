'use client';

import * as React from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import ErrorMessage from '@/components/ui/error-message';
import TimePicker from '@/components/ui/time-picker';
import { useRescheduleAppointment } from '@/integration/appointments';
import { format, parseISO, isBefore } from 'date-fns';
import type { Appointment } from '@/integration/appointments/types';
import { cn } from '@/lib/utils';
import { RescheduleFormValues } from './types';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { getErrorMessage } from '@/integration';

interface RescheduleAppointmentDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RescheduleAppointmentDialog({
  appointment,
  open,
  onOpenChange,
}: RescheduleAppointmentDialogProps) {
  const rescheduleMutation = useRescheduleAppointment();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RescheduleFormValues>({
    defaultValues: {
      date: appointment.startTime
        ? parseISO(appointment.startTime)
        : new Date(),
      startTime: appointment.startTime
        ? format(parseISO(appointment.startTime), 'HH:mm')
        : '',
      endTime: appointment.endTime
        ? format(parseISO(appointment.endTime), 'HH:mm')
        : '',
      rescheduleReason: '',
    },
  });

  const dateValue = useWatch({ control, name: 'date' });
  const startTimeValue = useWatch({ control, name: 'startTime' });
  const minDate = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const onRescheduleSubmit = async (data: RescheduleFormValues) => {
    try {
      const year = data.date.getFullYear();
      const month = data.date.getMonth();
      const day = data.date.getDate();

      const [startH, startM] = data.startTime.split(':').map(Number);
      const [endH, endM] = data.endTime.split(':').map(Number);

      const startDateTime = new Date(year, month, day, startH, startM);
      const endDateTime = new Date(year, month, day, endH, endM);

      if (isBefore(startDateTime, new Date())) {
        toast.error('Cannot reschedule to a past date or time.');
        return;
      }

      if (isBefore(endDateTime, startDateTime)) {
        toast.error('End time must be after start time.');
        return;
      }

      const startTime = startDateTime.toISOString();
      const endTime = endDateTime.toISOString();

      await rescheduleMutation.mutateAsync({
        id: appointment.id,
        data: {
          startTime,
          endTime,
          reschedulingReason: data.rescheduleReason,
        },
      });
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onRescheduleSubmit)}
          className="space-y-4 py-4"
        >
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Date row */}
            <div className="flex flex-col space-y-2">
              <Label className="text-sm font-medium text-gray-700">Date</Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'h-11 w-full justify-between rounded-lg border-(--border-light) input-shadow font-normal hover:bg-gray-50',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>dd/mm/yyyy</span>
                        )}
                        <CalendarIcon className="mr-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 duration-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={{ before: minDate }}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              <ErrorMessage message={errors.date?.message} />
            </div>

            {/* Start time + End time */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Start time
                </Label>
                <TimePicker
                  control={control}
                  name="startTime"
                  placeholder="Select start time"
                  selectedDate={dateValue}
                  ignorePastTimes={!!dateValue}
                  disabled={rescheduleMutation.isPending}
                />
                <ErrorMessage message={errors.startTime?.message} />
              </div>
              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  End time
                </Label>
                <TimePicker
                  control={control}
                  name="endTime"
                  placeholder="Select end time"
                  selectedDate={dateValue}
                  ignorePastTimes={!!dateValue}
                  disabled={rescheduleMutation.isPending || !startTimeValue}
                />
                <ErrorMessage message={errors.endTime?.message} />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Reason for Rescheduling
              </Label>
              <Controller
                name="rescheduleReason"
                control={control}
                rules={{ required: 'Reason for rescheduling is required' }}
                render={({ field }) => (
                  <textarea
                    className={cn(
                      'w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-blue focus:outline-none min-h-[100px]'
                    )}
                    placeholder="Reason for rescheduling..."
                    {...field}
                  />
                )}
              />
              <ErrorMessage message={errors.rescheduleReason?.message} />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full!"
              onClick={() => onOpenChange(false)}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-brand-blue hover:bg-brand-blue/90 rounded-full!"
              disabled={rescheduleMutation.isPending}
            >
              {rescheduleMutation.isPending ? <Spinner /> : 'Confirm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
