'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, CalendarCheck, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { format, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Appointment,
  useCreateAppointment,
  useGetAppointmentByIdMutation,
} from '@/integration/appointments';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBeginCall } from '@/hooks/page-hooks/video-call/use-begin-call';
import { Patient } from '@/types/patient.types';
import { PatientSelection } from './patient-selection';
import AvailabilitySlotPicker from '@/components/dashboard/availability-slot-picker';
import { combineDateAndTime } from '@/lib/datetime';
import { getDoctorAvailability } from '@/integration/settings/api';
import {
  isClosedCalendarDay,
  type HourSlot,
} from '@/stores/availability-store';
import useUser from '@/hooks/useUser';
import { useGetPatientById } from '@/integration/patient';

function SuccessModal({
  isOpen,
  onClose,
  patientName,
  isLoading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  isLoading?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[383px] scale-100 transform overflow-hidden rounded-2xl bg-(--bg-white) p-6 shadow-xl transition-all animate-in zoom-in-95 duration-200 mx-4">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue">
            <CalendarCheck className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-(--text-primary)">
              Appointment Confirmed
            </h3>
            <p className="text-sm text-(--text-muted) max-w-xs mx-auto">
              Appointment confirmed for{' '}
              <span className="font-semibold text-(--text-primary)">
                {patientName}
              </span>
            </p>
          </div>

          <div className="w-full border-t border-dashed border-(--border-stroke) my-2" />

          <div className="w-full pt-2">
            <Button
              className="w-full rounded-full bg-brand-blue h-10 hover:bg-brand-blue/90"
              onClick={onClose}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Done'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function isSlotInFuture(slot: HourSlot, selectedDate?: Date) {
  if (!selectedDate) return true;
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const todayGmt = new Date().toISOString().slice(0, 10);
  if (dateStr !== todayGmt) return dateStr > todayGmt;
  const [hours, minutes] = slot.start.split(':').map(Number);
  const now = new Date();
  return hours * 60 + minutes > now.getUTCHours() * 60 + now.getUTCMinutes();
}

export function ScheduleAppointmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdFromQuery = searchParams.get('patientId');
  const { userId } = useUser();

  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(
    null
  );

  const { data: patientData } = useGetPatientById(patientIdFromQuery || '');

  React.useEffect(() => {
    if (patientData && !selectedPatient) {
      setSelectedPatient(patientData as unknown as Patient);
    }
  }, [patientData, selectedPatient]);

  const [isScheduleNow, setIsScheduleNow] = React.useState(false);
  const [date, setDate] = React.useState<Date>();
  const [dateOpen, setDateOpen] = React.useState(false);
  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');
  const [isSuccessOpen, setIsSuccessOpen] = React.useState(false);
  const [dateError, setDateError] = React.useState('');
  const [slotError, setSlotError] = React.useState('');

  const beginCall = useBeginCall();

  const minDate = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const [createdAppointmentId, setCreatedAppointmentId] = React.useState<
    string | null
  >(null);

  const { mutate: createAppointment, isPending: isCreating } =
    useCreateAppointment();

  const dateStr = date ? format(date, 'yyyy-MM-dd') : undefined;
  const { data: weekAvailability } = useQuery({
    queryKey: ['doctor-availability', userId, 'week'],
    queryFn: () => getDoctorAvailability(userId),
    enabled: Boolean(userId),
    retry: 0,
  });
  const { data: remoteAvailability, isPending: slotsLoading } = useQuery({
    queryKey: ['doctor-availability', userId, dateStr],
    queryFn: () => getDoctorAvailability(userId, dateStr),
    enabled: Boolean(userId && dateStr),
    retry: 0,
  });

  const availableSlots = React.useMemo(() => {
    return (remoteAvailability?.slots ?? []).filter((slot) =>
      isSlotInFuture(slot, date)
    );
  }, [date, remoteAvailability?.slots]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient.id === selectedPatient?.id ? null : patient);
  };

  const isFormValid =
    selectedPatient &&
    (isScheduleNow ||
      (date && startTime && endTime && !dateError && !slotError));

  const handleConfirm = () => {
    if (!isFormValid || !selectedPatient) return;

    let startTimeStr: string | undefined;
    let endTimeStr: string | undefined;

    if (!isScheduleNow && date && startTime && endTime) {
      startTimeStr = combineDateAndTime(dateStr || '', startTime);
      endTimeStr = combineDateAndTime(dateStr || '', endTime);

      if (
        dateStr === new Date().toISOString().slice(0, 10) &&
        isBefore(new Date(startTimeStr), new Date())
      ) {
        setSlotError('Start time cannot be in the past');
        toast.error('Start time cannot be in the past');
        return;
      }
    }

    createAppointment(
      {
        patientId: selectedPatient.id,
        isImmediate: isScheduleNow,
        startTime: startTimeStr,
        endTime: endTimeStr,
      },
      {
        onSuccess: (response) => {
          setIsSuccessOpen(true);
          if (isScheduleNow) {
            setCreatedAppointmentId(response.id);
          }
        },
        onError: (error) => {
          toast.error('Failed to create appointment. Please try again.');
          console.error('Create appointment error:', error);
        },
      }
    );
  };

  const { mutate, isPending: isLoadingAppointment } =
    useGetAppointmentByIdMutation();

  const handleSuccessClose = () => {
    if (!patientData?.isRegistrationComplete) {
      router.push('/dashboard');
      return;
    }
    if (createdAppointmentId) {
      mutate(createdAppointmentId, {
        onSuccess: (response) => {
          const patient = response.patient as unknown as Patient;
          const rawAppointment = response as Appointment;

          if (patient) {
            beginCall(rawAppointment as Appointment, patient as Patient);
          }
          setIsSuccessOpen(false);
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onError: (error) => {
          toast.error('Failed to start appointment. Please try again.');
        },
      });
    } else {
      setIsSuccessOpen(false);
      router.push('/dashboard');
    }
  };

  return (
    <div className="space-y-8">
      <PatientSelection
        selectedPatient={selectedPatient}
        onSelect={handlePatientSelect}
      />

      <div className="space-y-4">
        <Label className="text-sm font-medium text-(--text-gray) mb-4">
          Schedule Time
        </Label>

        <Button
          variant="outline"
          className={cn(
            'mt-2 w-full h-14 rounded-full text-base font-medium transition-all',
            isScheduleNow
              ? 'bg-brand-blue text-white hover:bg-brand-blue/90 hover:text-white  border-transparent'
              : 'border-(--border-stroke) text-(--text-primary) hover:bg-(--bg-primary) bg-(--bg-white)'
          )}
          onClick={() => setIsScheduleNow(!isScheduleNow)}
        >
          <CalendarIcon className="mr-2 h-5 w-5" />
          Schedule Now
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-(--border-stroke)"></div>
          </div>
          <div className="relative bg-(--bg-white) px-4 text-sm text-(--text-muted)">
            Or
          </div>
        </div>

        <div
          className={cn(
            'transition-opacity',
            isScheduleNow && 'opacity-50 pointer-events-none'
          )}
        >
          <AvailabilitySlotPicker
            date={date}
            onDateChange={(next) => {
              setDate(next);
              setStartTime('');
              setEndTime('');
              setSlotError('');
              setDateError(next ? '' : dateError);
            }}
            dateOpen={dateOpen}
            onDateOpenChange={setDateOpen}
            selectedStart={startTime || undefined}
            selectedEnd={endTime || undefined}
            onSelectSlot={(slot) => {
              setStartTime(slot.start);
              setEndTime(slot.end);
              setSlotError('');
            }}
            slots={availableSlots}
            slotsLoading={slotsLoading}
            timezone={
              remoteAvailability?.timezone ?? weekAvailability?.timezone
            }
            doctorSelected={Boolean(userId)}
            disabled={isScheduleNow || isCreating}
            dateError={dateError}
            slotError={slotError}
            minDate={minDate}
            disabledDate={(day) => isClosedCalendarDay(weekAvailability, day)}
          />
        </div>
      </div>

      <Button
        className="w-full h-14 rounded-full bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold text-base shadow-lg shadow-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleConfirm}
        disabled={!isFormValid || isCreating}
      >
        {isCreating ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          'Confirm Appointment'
        )}
      </Button>

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={handleSuccessClose}
        patientName={
          selectedPatient?.fullName || selectedPatient?.patientId || 'Patient'
        }
        isLoading={isLoadingAppointment}
      />
    </div>
  );
}
