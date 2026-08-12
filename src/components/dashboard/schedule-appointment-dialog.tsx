'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check } from 'lucide-react';
import TimePicker from '@/components/ui/time-picker';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Patient } from '@/types/patient.types';
import CloseSvg from '@/assets/icons/close-svg';
import ErrorMessage from '@/components/ui/error-message';
import ChevronDownSvg from '@/assets/icons/chevron-down-svg';
import { useVideoCallStore } from '@/stores/video-call-store';
import { Spinner } from '../ui/spinner';
import { useAppointmentMutations } from '@/integration/appointments';
import { toast } from 'sonner';
import { combineDateAndTime } from '@/lib/datetime';
import { getErrorMessage } from '@/integration';
import { useDoctors } from '@/hooks/page-hooks/useDoctors';
import { Appointment } from '@/types/appointment.types';

interface ScheduleAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient;
}

const scheduleSchema = z
  .object({
    mode: z.enum(['now', 'later']),
    doctorId: z.string().min(1, 'Please select a doctor'),
    date: z.date().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.mode === 'later') {
        return data.date !== undefined;
      }
      return true;
    },
    {
      message: 'Date is required when scheduling for later',
      path: ['date'],
    }
  )
  .refine(
    (data) => {
      if (data.mode === 'later') {
        return data.startTime !== undefined && data.startTime !== '';
      }
      return true;
    },
    {
      message: 'Start time is required when scheduling for later',
      path: ['startTime'],
    }
  )
  .refine(
    (data) => {
      if (data.mode === 'later') {
        return data.endTime !== undefined && data.endTime !== '';
      }
      return true;
    },
    {
      message: 'End time is required when scheduling for later',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      if (
        data.mode === 'later' &&
        data.date &&
        data.startTime &&
        data.endTime
      ) {
        const [startHours, startMinutes] = data.startTime
          .split(':')
          .map(Number);
        const [endHours, endMinutes] = data.endTime.split(':').map(Number);
        const startTotal = startHours * 60 + startMinutes;
        const endTotal = endHours * 60 + endMinutes;
        return endTotal > startTotal;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

export type ScheduleFormData = z.infer<typeof scheduleSchema>;

const ScheduleAppointmentDialog = ({
  open,
  onOpenChange,
  patient,
}: ScheduleAppointmentDialogProps) => {
  const { clinicians, cliniciansWithSearch, isLoading } = useDoctors();
  const { startCall, setSelectedAppointment } = useVideoCallStore();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    mode: 'onChange',
    defaultValues: {
      mode: 'now',
      doctorId: '',
      date: undefined,
      startTime: undefined,
      endTime: undefined,
    },
  });

  const mode = watch('mode');
  const selectedDoctorId = watch('doctorId');
  const selectedDate = watch('date');
  const startTime = watch('startTime');

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const { scheduleAppointmentMutation, getAppointmentByIdMutation } =
    useAppointmentMutations();

  const isSubmitting =
    scheduleAppointmentMutation.isPending ||
    getAppointmentByIdMutation.isPending;

  const onSubmit = useCallback(
    async (data: ScheduleFormData) => {
      if (!patient) return;

      let startTimeISO: string | undefined;
      let endTimeISO: string | undefined;

      if (data.mode === 'later' && data.date) {
        if (data.startTime) {
          const dateStr = format(data.date, 'yyyy-MM-dd');
          startTimeISO = combineDateAndTime(dateStr, data.startTime);
        }
        if (data.endTime) {
          const dateStr = format(data.date, 'yyyy-MM-dd');
          endTimeISO = combineDateAndTime(dateStr, data.endTime);
        }
      }

      scheduleAppointmentMutation.mutate(
        {
          patientId: patient.id,
          isImmediate: data.mode === 'now',
          doctorId: data.doctorId,
          ...(startTimeISO && { startTime: startTimeISO }),
          ...(endTimeISO && { endTime: endTimeISO }),
        },
        {
          onSuccess: (res) => {
            if (data.mode === 'now' && patient) {
              getAppointmentByIdMutation.mutate(res.id, {
                onSuccess: (response) => {
                  if (patient?.isRegistrationComplete) {
                    startCall(patient);
                    setSelectedAppointment(
                      response as any,
                      patient
                    );
                  }
                },
              });
            }
            toast.success('Appointment scheduled successfully');
            onOpenChange(false);
            reset();
          },
          onError: (error: Error) => {
            toast.error(
              getErrorMessage(error) || 'Failed to schedule appointment'
            );
          },
        }
      );
    },
    [
      patient,
      scheduleAppointmentMutation,
      onOpenChange,
      reset,
      startCall,
      getAppointmentByIdMutation,
      setSelectedAppointment,
    ]
  );

  const selectedDoctor = useMemo(() => {
    return clinicians.find((c) => c.id === selectedDoctorId);
  }, [clinicians, selectedDoctorId]);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white rounded-[30px] p-6 max-w-[443px] w-full">
        <AlertDialogTitle className="sr-only">
          Schedule Appointment
        </AlertDialogTitle>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-5 top-5 w-6 h-6 flex items-center justify-center"
        >
          <CloseSvg />
        </button>

        <div className="flex flex-col gap-[36px] items-start w-full">
          <div className="flex flex-col gap-[40px] items-start w-full">
            <div className="flex flex-col gap-[2px] items-start">
              <h2 className="font-bold leading-[20px] text-(--text-dark) text-[16px]">
                Schedule Appointment
              </h2>
              <p className="font-normal leading-[20px] text-(--text-gray) text-[14px]">
                Schedule consultation now or for later
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-[24px] items-start w-full"
            >
              {/* Mode Selection */}
              <div className="flex gap-4 items-start w-full">
                <Controller
                  name="mode"
                  control={control}
                  render={({ field }) => (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          field.onChange('now');
                          setValue('date', undefined);
                          setValue('startTime', undefined);
                          setValue('endTime', undefined);
                        }}
                        className={cn(
                          'flex-1 flex flex-col gap-1 items-center px-[10px] py-5 rounded-[12px] border transition-colors',
                          field.value === 'now'
                            ? 'bg-(--bg-info) border-(--brand-blue-light)'
                            : 'bg-(--bg-white) border-(--border-stroke)'
                        )}
                      >
                        <span className="font-bold text-[16px] leading-[1.2] text-center w-full">
                          Start Now
                        </span>
                        <span className="font-normal text-[12px] leading-[1.2] text-center w-full">
                          Immediate consultation
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange('later')}
                        className={cn(
                          'flex-1 flex flex-col gap-1 items-center px-[10px] py-5 rounded-[12px] border transition-colors',
                          field.value === 'later'
                            ? 'bg-(--bg-info) border-(--brand-blue-light)'
                            : 'bg-(--bg-white) border-(--border-stroke)'
                        )}
                      >
                        <span className="font-bold text-[16px] leading-[1.2] text-center w-full">
                          Schedule for Later
                        </span>
                        <span className="font-normal text-[12px] leading-[1.2] text-center w-full">
                          Pick date & time
                        </span>
                      </button>
                    </>
                  )}
                />
              </div>

              {/* Doctor Selection */}
              <div className="flex flex-col gap-2 items-start w-full">
                <Label className="font-medium leading-[20px] text-(--text-label) text-[14px]">
                  Doctor
                </Label>
                <Controller
                  name="doctorId"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'bg-(--bg-white) border border-(--border-light) flex gap-2 items-center justify-between px-[14px] py-[10px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] w-full h-[44px] text-left hover:bg-gray-50 transition-colors'
                          )}
                        >
                          <span
                            className={cn(
                              'flex-1 font-normal leading-[24px] text-[14px]',
                              selectedDoctor
                                ? 'text-(--text-primary)'
                                : 'text-(--text-placeholder)'
                            )}
                          >
                            {selectedDoctor
                              ? `${selectedDoctor.firstName} ${selectedDoctor.lastName}`
                              : 'Select doctor'}
                          </span>
                          <ChevronDownSvg />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-(--radix-popover-trigger-width) p-0"
                        align="start"
                      >
                        <Command shouldFilter={true}>
                          <CommandInput placeholder="Search doctor..." />
                          <CommandList className="max-h-none overflow-visible">
                            <ScrollArea
                              className="h-[200px]"
                              onWheel={(e) => e.stopPropagation()}
                              onTouchStart={(e) => e.stopPropagation()}
                            >
                              {isLoading ? (
                                <CommandEmpty>Loading...</CommandEmpty>
                              ) : cliniciansWithSearch.length === 0 ? (
                                <CommandEmpty>No doctors found.</CommandEmpty>
                              ) : (
                                <CommandGroup>
                                  {cliniciansWithSearch.map((clinician) => (
                                    <CommandItem
                                      key={clinician.id}
                                      value={clinician.searchValue}
                                      onSelect={() =>
                                        field.onChange(clinician.id)
                                      }
                                      className="flex items-center gap-2"
                                    >
                                      <Check
                                        className={cn(
                                          'w-4 h-4',
                                          field.value === clinician.id
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        )}
                                      />
                                      <div className="flex flex-col">
                                        <span className="text-sm font-normal">
                                          {clinician.firstName}{' '}
                                          {clinician.lastName}
                                        </span>
                                        {clinician.email && (
                                          <span className="text-xs text-(--text-muted)">
                                            {clinician.email}
                                          </span>
                                        )}
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                            </ScrollArea>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <ErrorMessage message={errors.doctorId?.message} />
              </div>

              {/* Date and Time - Only show when mode is 'later' */}
              {mode === 'later' && (
                <>
                  <div className="flex flex-col gap-2 items-start w-full">
                    <Label className="font-medium leading-[20px] text-(--text-label) text-[14px]">
                      Date
                    </Label>
                    <Controller
                      name="date"
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                'bg-(--bg-white) border border-(--border-light) flex gap-2 items-center justify-between px-[14px] py-[10px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] w-full h-[44px] text-left hover:bg-gray-50 transition-colors',

                                !field.value && 'text-(--text-placeholder)'
                              )}
                            >
                              <span className="flex-1 font-normal leading-[24px] text-[14px] text-left">
                                {field.value
                                  ? format(field.value, 'dd/MM/yyyy')
                                  : 'dd/mm/yyyy'}
                              </span>
                              <CalendarIcon className="w-4 h-4 text-(--text-secondary) shrink-0" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date: Date) => date < today}
                              captionLayout="dropdown"
                              initialFocus={false}
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    <ErrorMessage message={errors.date?.message} />
                  </div>

                  <div className="flex flex-col gap-2 items-start w-full">
                    <Label className="font-medium leading-[20px] text-(--text-label) text-[14px]">
                      Start Time
                    </Label>
                    <TimePicker
                      control={control}
                      name="startTime"
                      placeholder="--:--"
                      selectedDate={selectedDate}
                      ignorePastTimes={true}
                      disabled={isSubmitting}
                    />
                    <ErrorMessage message={errors.startTime?.message} />
                  </div>

                  <div className="flex flex-col gap-2 items-start w-full">
                    <Label className="font-medium leading-[20px] text-(--text-label) text-[14px]">
                      End Time
                    </Label>
                    <TimePicker
                      control={control}
                      name="endTime"
                      placeholder="--:--"
                      selectedDate={selectedDate}
                      ignorePastTimes={false}
                      disabled={isSubmitting || !startTime}
                    />
                    <ErrorMessage message={errors.endTime?.message} />
                  </div>
                </>
              )}

              <Button
                type="submit"
                variant="brand"
                disabled={isSubmitting}
                className="w-full h-[50px] rounded-[8px] px-4 py-4 text-[14px] font-bold leading-[20px]"
              >
                {isSubmitting ? <Spinner /> : 'Confirm Schedule'}
              </Button>
            </form>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ScheduleAppointmentDialog;
