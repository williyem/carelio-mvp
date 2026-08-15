'use client';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import ErrorMessage from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';
import { useAddPatientForm } from '@/hooks/page-hooks/use-add-patient-form';
import { useRouter } from 'nextjs-toploader/app';
import AvailabilitySlotPicker from '@/components/dashboard/availability-slot-picker';
import { getDoctorAvailability } from '@/integration/settings/api';
import {
  isClosedCalendarDay,
  type HourSlot,
} from '@/stores/availability-store';
import useUser from '@/hooks/useUser';

interface SuccessModalProps {
  email: string;
  isOpen: boolean;
  onClose: () => void;
  onAddAnother: () => void;
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

function SuccessModal({
  email,
  isOpen,
  onClose,
  onAddAnother,
}: SuccessModalProps) {
  const router = useRouter();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="mx-4 w-full max-w-md scale-100 transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-brand-blue">
            <Send className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">
              Invitation Sent Successfully
            </h3>
            <p className="mx-auto max-w-xs text-sm text-gray-500">
              An email has been sent to{' '}
              <span className="font-semibold text-gray-900">{email}</span> with
              instructions to complete their profile.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1 rounded-full border-brand-blue text-brand-blue hover:bg-blue-50"
              onClick={onAddAnother}
            >
              Send Another Invite
            </Button>
            <Button
              className="flex-1 rounded-full bg-brand-blue hover:bg-brand-blue/90"
              onClick={() => {
                onClose();

                router.push('/dashboard');
              }}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AddPatientForm() {
  const { userId } = useUser();
  const [dateOpen, setDateOpen] = useState(false);
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isValid },
    includeAppointment,
    date,
    startTime,
    endTime,
    isSuccessOpen,
    submittedEmail,
    isPending,
    handleAddAnother,
    handleCloseSuccess,
  } = useAddPatientForm();

  const minDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const dateStr = date ? format(date, 'yyyy-MM-dd') : undefined;
  const { data: weekAvailability } = useQuery({
    queryKey: ['doctor-availability', userId, 'week'],
    queryFn: () => getDoctorAvailability(userId),
    enabled: Boolean(userId && includeAppointment),
    retry: 0,
  });
  const { data: remoteAvailability, isPending: slotsLoading } = useQuery({
    queryKey: ['doctor-availability', userId, dateStr],
    queryFn: () => getDoctorAvailability(userId, dateStr),
    enabled: Boolean(userId && includeAppointment && dateStr),
    retry: 0,
  });

  const availableSlots = useMemo(() => {
    return (remoteAvailability?.slots ?? []).filter((slot) =>
      isSlotInFuture(slot, date)
    );
  }, [date, remoteAvailability?.slots]);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Card className="overflow-hidden  card">
          <CardContent className="space-y-6 p-6">
            <div className="space-y-3 flex items-start justify-between gap-4">
              <div className="flex flex-col basis-full gap-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-bold text-gray-900"
                >
                  Patient Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    className="h-12 rounded-lg border-gray-200 bg-gray-50 pl-10"
                    disabled={isPending}
                    {...register('email')}
                  />
                </div>
                <ErrorMessage message={errors.email?.message} />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              An invitation email with a registration link will be sent to the
              patient. Phone number is stored on their profile only and is not
              used for delivery.
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden card ">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-gray-900">
                  Schedule Appointment
                </Label>
                <p className="text-sm text-gray-500">
                  Include an appointment request with the invite
                </p>
              </div>
              <Controller
                name="includeAppointment"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (!checked) {
                        setValue('date', undefined, { shouldValidate: true });
                        setValue('startTime', '', { shouldValidate: true });
                        setValue('endTime', '', { shouldValidate: true });
                      }
                    }}
                  />
                )}
              />
            </div>

            {includeAppointment && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <AvailabilitySlotPicker
                  date={date}
                  onDateChange={(next) => {
                    setValue('date', next, { shouldValidate: true });
                    setValue('startTime', '', { shouldValidate: true });
                    setValue('endTime', '', { shouldValidate: true });
                  }}
                  dateOpen={dateOpen}
                  onDateOpenChange={setDateOpen}
                  selectedStart={startTime || undefined}
                  selectedEnd={endTime || undefined}
                  onSelectSlot={(slot) => {
                    setValue('startTime', slot.start, { shouldValidate: true });
                    setValue('endTime', slot.end, { shouldValidate: true });
                  }}
                  slots={availableSlots}
                  slotsLoading={slotsLoading}
                  timezone={
                    remoteAvailability?.timezone ?? weekAvailability?.timezone
                  }
                  doctorSelected={Boolean(userId)}
                  disabled={isPending}
                  dateError={errors.date?.message}
                  slotError={
                    errors.startTime?.message || errors.endTime?.message
                  }
                  minDate={minDate}
                  disabledDate={(day) =>
                    isClosedCalendarDay(weekAvailability, day)
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="h-12 w-full rounded-full bg-brand-blue text-base font-semibold text-white  hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!isValid || isPending}
        >
          {isPending ? <Spinner /> : 'Send Invitation'}
        </Button>
      </form>

      <SuccessModal
        isOpen={isSuccessOpen}
        email={submittedEmail}
        onClose={handleCloseSuccess}
        onAddAnother={handleAddAnother}
      />
    </div>
  );
}
