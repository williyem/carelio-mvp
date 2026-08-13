'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CalendarCheck,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, isToday, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Appointment,
  useCreateAppointment,
  useGetAppointmentByIdMutation,
} from '@/integration/appointments';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVideoCallStore } from '@/stores/video-call-store';
import { Patient } from '@/types/patient.types';
import { PatientSelection } from './patient-selection';
import ErrorMessage from '@/components/ui/error-message';
import { useGetPatientById } from '@/integration/patient';

const TIME_SLOTS = [
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
  '07:30 PM',
  '08:00 PM',
];

const getTimeValue = (timeStr: string) => {
  const [timePart, period] = timeStr.split(' ');
  const [hours, minutes] = timePart.split(':').map(Number);
  let h24 = hours;
  if (period === 'PM' && h24 !== 12) h24 += 12;
  if (period === 'AM' && h24 === 12) h24 = 0;
  return h24 * 60 + minutes;
};

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
      <div className="w-full max-w-[383px] scale-100 transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all animate-in zoom-in-95 duration-200 mx-4">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue">
            <CalendarCheck className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">
              Appointment Scheduled
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Appointment scheduled for{' '}
              <span className="font-semibold text-gray-900">{patientName}</span>
            </p>
          </div>

          <div className="w-full border-t border-dashed border-gray-200 my-2" />

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

export function ScheduleAppointmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdFromQuery = searchParams.get('patientId');

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
  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');
  const [isSuccessOpen, setIsSuccessOpen] = React.useState(false);

  // Error states
  const [dateError, setDateError] = React.useState('');
  const [startTimeError, setStartTimeError] = React.useState('');
  const [endTimeError, setEndTimeError] = React.useState('');

  const { startCall, setSelectedAppointment } = useVideoCallStore();

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

  // Reset times and errors when date changes
  React.useEffect(() => {
    if (!isScheduleNow) {
      setStartTime('');
      setEndTime('');
      setStartTimeError('');
      setEndTimeError('');
      if (date) {
        setDateError('');
      }
    }
  }, [date, isScheduleNow]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient.id === selectedPatient?.id ? null : patient);
  };

  const isFormValid =
    selectedPatient &&
    (isScheduleNow ||
      (date &&
        startTime &&
        endTime &&
        !dateError &&
        !startTimeError &&
        !endTimeError));

  const handleConfirm = () => {
    if (!isFormValid || !selectedPatient) return;

    let startTimeStr: string | undefined;
    let endTimeStr: string | undefined;

    if (!isScheduleNow && date && startTime && endTime) {
      const parseTime = (timeStr: string) => {
        const [timePart, period] = timeStr.split(' ');
        const [hours, minutes] = timePart.split(':').map(Number);
        let hour24 = hours;
        if (period === 'PM' && hours !== 12) hour24 += 12;
        if (period === 'AM' && hours === 12) hour24 = 0;
        return { hour24, minutes };
      };

      const startParsed = parseTime(startTime);
      const startDate = new Date(date);
      startDate.setHours(startParsed.hour24, startParsed.minutes, 0, 0);

      // Final validation before confirm
      if (isToday(date)) {
        const now = new Date();
        if (isBefore(startDate, now)) {
          setStartTimeError('Start time cannot be in the past');
          toast.error('Start time cannot be in the past');
          return;
        }
      }

      startTimeStr = startDate.toISOString();

      const endParsed = parseTime(endTime);
      const endDate = new Date(date);
      endDate.setHours(endParsed.hour24, endParsed.minutes, 0, 0);

      if (isBefore(endDate, startDate)) {
        setEndTimeError('End time must be after start time');
        toast.error('End time must be after start time');
        return;
      }

      endTimeStr = endDate.toISOString();
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
            startCall(patient as Patient);
          }
          setSelectedAppointment(
            rawAppointment as Appointment,
            patient as Patient
          );
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

  const handleStartTimeChange = (newStartTime: string) => {
    setStartTime(newStartTime);
    setStartTimeError(''); // Clear error on change
    const startValue = getTimeValue(newStartTime);

    // Validation for past time today
    if (date && isToday(date)) {
      const now = new Date();
      const currentTimeValue = now.getHours() * 60 + now.getMinutes();
      if (startValue <= currentTimeValue) {
        setStartTimeError('Start time cannot be in the past');
      }
    }

    const defaultEndValue = startValue + 60;
    const defaultEndTime = TIME_SLOTS.find(
      (slot) => getTimeValue(slot) === defaultEndValue
    );
    if (defaultEndTime) {
      setEndTime(defaultEndTime);
      setEndTimeError('');
    } else {
      setEndTime('');
    }
  };

  const handleEndTimeChange = (newEndTime: string) => {
    setEndTime(newEndTime);
    setEndTimeError('');
    if (startTime) {
      if (getTimeValue(newEndTime) <= getTimeValue(startTime)) {
        setEndTimeError('End time must be after start time');
      }
    }
  };

  const filteredStartTimeSlots = React.useMemo(() => {
    if (!date || !isToday(date)) return TIME_SLOTS;
    const now = new Date();
    const currentTimeValue = now.getHours() * 60 + now.getMinutes();
    return TIME_SLOTS.filter((slot) => getTimeValue(slot) > currentTimeValue);
  }, [date]);

  const filteredEndTimeSlots = React.useMemo(() => {
    if (!startTime) return TIME_SLOTS;
    const startValue = getTimeValue(startTime);
    return TIME_SLOTS.filter((slot) => getTimeValue(slot) > startValue);
  }, [startTime]);

  return (
    <div className="space-y-8">
      <PatientSelection
        selectedPatient={selectedPatient}
        onSelect={handlePatientSelect}
      />

      {/* Schedule Time */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700 mb-4">
          Schedule Time
        </Label>

        <Button
          variant="outline"
          className={cn(
            'mt-2 w-full h-14 rounded-full text-base font-medium transition-all',
            isScheduleNow
              ? 'bg-brand-blue text-white hover:bg-brand-blue/90 hover:text-white  border-transparent'
              : 'border-gray-200 text-gray-900 hover:bg-gray-50 bg-white'
          )}
          onClick={() => setIsScheduleNow(!isScheduleNow)}
        >
          <CalendarIcon className="mr-2 h-5 w-5" />
          Schedule Now
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative bg-white px-4 text-sm text-gray-500">Or</div>
        </div>

        <div
          className={cn(
            'grid grid-cols-1 sm:grid-cols-3 gap-4 transition-opacity',
            isScheduleNow && 'opacity-50 pointer-events-none'
          )}
        >
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full h-14 justify-start text-left font-normal rounded-lg bg-gray-50 border-gray-200 hover:bg-gray-50',
                    !date && 'text-muted-foreground'
                  )}
                  disabled={isScheduleNow}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>dd/mm/yyyy</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 duration-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={{ before: minDate }}
                />
              </PopoverContent>
            </Popover>
            <ErrorMessage message={dateError} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Start Time
            </Label>
            <Select
              value={startTime}
              onValueChange={handleStartTimeChange}
              disabled={isScheduleNow}
            >
              <SelectTrigger className="w-full h-14! rounded-lg bg-gray-50 border-gray-200">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="Start Time" />
                </div>
              </SelectTrigger>
              <SelectContent position="popper">
                {filteredStartTimeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ErrorMessage message={startTimeError} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              End Time
            </Label>
            <Select
              value={endTime}
              onValueChange={handleEndTimeChange}
              disabled={isScheduleNow || !startTime}
            >
              <SelectTrigger className="w-full h-14! rounded-lg bg-gray-50 border-gray-200">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="End Time" />
                </div>
              </SelectTrigger>
              <SelectContent position="popper">
                {filteredEndTimeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ErrorMessage message={endTimeError} />
          </div>
        </div>
      </div>

      {/* Action Button */}
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
