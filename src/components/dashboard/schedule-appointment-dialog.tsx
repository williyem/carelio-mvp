'use client';

import { useEffect, useMemo, useCallback, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import AvailabilitySlotPicker from '@/components/dashboard/availability-slot-picker';
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
import {
  getRangesForDate,
  useAvailabilityStore,
} from '@/stores/availability-store';
import { useAccessGrantStore } from '@/stores/access-grant-store';
import {
  getDoctorAvailability,
  getAccessGrants,
} from '@/integration/settings/api';

interface ScheduleAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient;
  /** Which auth/BFF path to use for scheduling */
  portal?: 'staff' | 'patient' | 'health-assistant';
  onScheduled?: () => void;
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
  portal = 'staff',
  onScheduled,
}: ScheduleAppointmentDialogProps) => {
  const { clinicians, cliniciansWithSearch, isLoading } = useDoctors();
  const localGrantedIds = useAccessGrantStore((s) => s.grantedIds);
  const getAvailability = useAvailabilityStore((s) => s.getAvailability);
  const { startCall, setSelectedAppointment } = useVideoCallStore();

  const {
    control,
    handleSubmit,
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

  const mode = useWatch({ control, name: 'mode' });
  const selectedDoctorId = useWatch({ control, name: 'doctorId' });
  const selectedDate = useWatch({ control, name: 'date' });
  const startTime = useWatch({ control, name: 'startTime' });
  const endTime = useWatch({ control, name: 'endTime' });
  const [doctorOpen, setDoctorOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const { scheduleAppointmentMutation, getAppointmentByIdMutation } =
    useAppointmentMutations(portal);

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
  const { data: remoteAvailability } = useQuery({
    queryKey: ['doctor-availability', selectedDoctorId, dateStr],
    queryFn: () => getDoctorAvailability(selectedDoctorId, dateStr),
    enabled: Boolean(selectedDoctorId),
    retry: 0,
  });

  const { data: accessGrants } = useQuery({
    queryKey: ['patient-access-grants'],
    queryFn: getAccessGrants,
    enabled: portal === 'patient',
    retry: 0,
  });

  const grantedIds = accessGrants?.grantedIds ?? localGrantedIds;

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
            if (data.mode === 'now' && patient && portal === 'staff') {
              getAppointmentByIdMutation.mutate(res.id, {
                onSuccess: (response) => {
                  if (patient?.isRegistrationComplete) {
                    startCall(patient);
                    setSelectedAppointment(response as Appointment, patient);
                  }
                },
              });
            }
            toast.success('Appointment confirmed');
            onScheduled?.();
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
      portal,
      scheduleAppointmentMutation,
      onOpenChange,
      onScheduled,
      reset,
      startCall,
      getAppointmentByIdMutation,
      setSelectedAppointment,
    ]
  );

  const selectedDoctor = useMemo(() => {
    return clinicians.find((c) => c.id === selectedDoctorId);
  }, [clinicians, selectedDoctorId]);

  const visibleClinicians = useMemo(() => {
    if (portal !== 'patient' || grantedIds.length === 0) {
      return cliniciansWithSearch;
    }
    return cliniciansWithSearch.filter((c) => grantedIds.includes(c.id));
  }, [cliniciansWithSearch, grantedIds, portal]);

  const allowedRanges = useMemo(() => {
    if (!selectedDoctorId || !selectedDate) return null;
    if (remoteAvailability) {
      return getRangesForDate(remoteAvailability, selectedDate);
    }
    return getRangesForDate(getAvailability(selectedDoctorId), selectedDate);
  }, [getAvailability, remoteAvailability, selectedDate, selectedDoctorId]);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setDoctorOpen(false);
          setDateOpen(false);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          'bg-white rounded-[30px] p-6 w-full',
          mode === 'later' ? 'max-w-[640px]' : 'max-w-[443px]'
        )}
        onPointerDownOutside={(event) => {
          const target = event.target as HTMLElement | null;
          if (
            target?.closest('[data-slot="popover-content"]') ||
            target?.closest('[data-slot="select-content"]') ||
            target?.closest('[data-radix-popper-content-wrapper]')
          ) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          const target = event.target as HTMLElement | null;
          if (
            target?.closest('[data-slot="popover-content"]') ||
            target?.closest('[data-slot="select-content"]') ||
            target?.closest('[data-radix-popper-content-wrapper]')
          ) {
            event.preventDefault();
          }
        }}
      >
        <DialogTitle className="sr-only">Schedule Appointment</DialogTitle>
        <button
          type="button"
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
                    <Popover
                      modal
                      open={doctorOpen}
                      onOpenChange={setDoctorOpen}
                    >
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
                        onOpenAutoFocus={(event) => event.preventDefault()}
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
                              ) : visibleClinicians.length === 0 ? (
                                <CommandEmpty>No doctors found.</CommandEmpty>
                              ) : (
                                <CommandGroup>
                                  {visibleClinicians.map((clinician) => (
                                    <CommandItem
                                      key={clinician.id}
                                      value={clinician.searchValue}
                                      onSelect={() => {
                                        field.onChange(clinician.id);
                                        setValue('date', undefined);
                                        setValue('startTime', undefined);
                                        setValue('endTime', undefined);
                                        setDoctorOpen(false);
                                      }}
                                      onPointerDown={(event) => {
                                        event.preventDefault();
                                        field.onChange(clinician.id);
                                        setValue('date', undefined);
                                        setValue('startTime', undefined);
                                        setValue('endTime', undefined);
                                        setDoctorOpen(false);
                                      }}
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

              {mode === 'later' && (
                <AvailabilitySlotPicker
                  date={selectedDate}
                  onDateChange={(next) => {
                    setValue('date', next, { shouldValidate: true });
                    setValue('startTime', undefined);
                    setValue('endTime', undefined);
                  }}
                  dateOpen={dateOpen}
                  onDateOpenChange={setDateOpen}
                  selectedStart={startTime}
                  selectedEnd={endTime}
                  onSelectSlot={(slot) => {
                    setValue('startTime', slot.start, { shouldValidate: true });
                    setValue('endTime', slot.end, { shouldValidate: true });
                  }}
                  ranges={allowedRanges}
                  slots={remoteAvailability?.slots}
                  timezone={remoteAvailability?.timezone}
                  doctorSelected={Boolean(selectedDoctorId)}
                  disabled={isSubmitting}
                  dateError={errors.date?.message}
                  slotError={
                    errors.startTime?.message || errors.endTime?.message
                  }
                  minDate={today}
                />
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
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleAppointmentDialog;
