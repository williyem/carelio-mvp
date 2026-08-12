'use client';
import { Controller } from 'react-hook-form';
import { Mail, Calendar as CalendarIcon, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PhoneInput } from '@/components/ui/phone-input';
import ErrorMessage from '@/components/ui/error-message';
import { Spinner } from '@/components/ui/spinner';
import { useAddPatientForm } from '@/hooks/page-hooks/use-add-patient-form';
import TimePicker from '../ui/time-picker';
import { useRouter } from 'nextjs-toploader/app';

interface SuccessModalProps {
  email: string;
  isOpen: boolean;
  onClose: () => void;
  onAddAnother: () => void;
  type: 'email' | 'phone' | 'emailPhone' | undefined;
}

const returnText = (type: 'email' | 'phone' | 'emailPhone' | undefined) => {
  switch (type) {
    case 'email':
      return 'An email';
    case 'phone':
      return 'An sms';
    case 'emailPhone':
      return 'An email and an sms';
    default:
      return 'An email and an sms';
  }
};

function SuccessModal({
  email,
  isOpen,
  onClose,
  onAddAnother,
  type,
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
              {returnText(type)} has been sent to{' '}
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
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
    includeAppointment,
    date,
    startTime,
    isSuccessOpen,
    submittedEmail,
    isPending,
    handleAddAnother,
    handleCloseSuccess,
    type,
  } = useAddPatientForm();

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Patient Email & Phone Card */}
        <Card className="overflow-hidden  card">
          <CardContent className="space-y-6 p-6">
            <div className="space-y-3 flex items-start justify-between gap-4">
              <div className="flex flex-col basis-1/2 gap-2">
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

              <div className="flex w-full flex-col basis-1/2 gap-2 items-start">
                <Label
                  htmlFor="phone-number"
                  className="text-sm font-bold text-gray-900"
                >
                  Phone Number
                </Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      defaultCountry="US"
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full"
                    />
                  )}
                />
                <ErrorMessage message={errors.phone?.message} />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              An invitation link will be sent to the provided contact details
              (email and/or phone number). The patient will use this link to
              complete their profile and gain access to the portal.
            </p>
          </CardContent>
        </Card>

        {/* Schedule Appointment Card */}
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
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            {includeAppointment && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Date row — full width on top */}
                <div className="flex flex-col space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Date
                  </Label>
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
                              'h-11 w-full  justify-between rounded-lg border-(--border-light) input-shadow  font-normal hover:bg-gray-50',
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
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  <ErrorMessage message={errors.date?.message} />
                </div>
                {/* Start time + End time — one row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Start time
                    </Label>
                    <TimePicker
                      control={control}
                      name="startTime"
                      placeholder="Select start time"
                      selectedDate={date}
                      ignorePastTimes={!!date}
                      disabled={isPending}
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
                      selectedDate={date}
                      ignorePastTimes={!!date}
                      disabled={isPending || !startTime}
                    />
                    <ErrorMessage message={errors.endTime?.message} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Button */}
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
        type={type}
      />
    </div>
  );
}
