import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useInvitePatient } from '@/integration/auth/doctor';
import { useCreateAppointment } from '@/integration/appointments';
import { getErrorMessage } from '@/integration/utils';
import type { InvitePatientRequest } from '@/integration/auth/doctor/types';

const isNotPastDate = (d: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date.getTime() >= today.getTime();
};

const addPatientSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    includeAppointment: z.boolean(),
    date: z.date().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.includeAppointment) return true;
      return !!data.date;
    },
    { message: 'Date is required', path: ['date'] }
  )
  .refine(
    (data) => {
      if (!data.includeAppointment || !data.date) return true;
      return isNotPastDate(data.date);
    },
    { message: 'Date cannot be in the past', path: ['date'] }
  )
  .refine(
    (data) => {
      if (!data.includeAppointment) return true;
      return !!data.startTime && data.startTime.length > 0;
    },
    { message: 'Start time is required', path: ['startTime'] }
  )
  .refine(
    (data) => {
      if (!data.includeAppointment || !data.startTime || !data.date)
        return true;
      const today = new Date();
      if (
        data.date.getDate() === today.getDate() &&
        data.date.getMonth() === today.getMonth() &&
        data.date.getFullYear() === today.getFullYear()
      ) {
        const [hours, minutes] = data.startTime.split(':').map(Number);
        const selectedTime = hours * 60 + minutes;
        const currentTime = today.getHours() * 60 + today.getMinutes();
        return selectedTime > currentTime;
      }
      return true;
    },
    { message: 'Start time cannot be in the past', path: ['startTime'] }
  )
  .refine(
    (data) => {
      if (!data.includeAppointment) return true;
      return !!data.endTime && data.endTime.length > 0;
    },
    { message: 'End time is required', path: ['endTime'] }
  )
  .refine(
    (data) => {
      if (!data.includeAppointment || !data.startTime || !data.endTime)
        return true;
      return data.endTime > data.startTime;
    },
    { message: 'End time must be after start time', path: ['endTime'] }
  );

export type AddPatientFormData = z.infer<typeof addPatientSchema>;

export function useAddPatientForm() {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [inviteLink, setInviteLink] = useState<string | undefined>();

  const { mutate: invitePatient, isPending: isInviting } = useInvitePatient();
  const { mutate: createAppointment, isPending: isCreating } =
    useCreateAppointment();

  const isPending = isInviting || isCreating;

  const form = useForm<AddPatientFormData>({
    resolver: zodResolver(addPatientSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      phone: '',
      includeAppointment: false,
      date: undefined,
      startTime: '',
      endTime: '',
    },
  });

  const includeAppointment = useWatch({
    control: form.control,
    name: 'includeAppointment',
  });
  const startTime = useWatch({ control: form.control, name: 'startTime' });
  const date = useWatch({ control: form.control, name: 'date' });

  const onSubmit = (data: AddPatientFormData) => {
    const payload: InvitePatientRequest = {
      email: data.email,
      phoneNumber: data.phone || undefined,
    };
    invitePatient(payload, {
      onSuccess: (response) => {
        setSubmittedEmail(data.email);
        setInviteLink(response.inviteLink);
        toast.success('Invitation email sent');

        if (data.includeAppointment && data.date && data.startTime) {
          const parseTime = (timeStr: string) => {
            const [timePart, period] = timeStr.split(' ');
            const [hours, minutes] = timePart.split(':').map(Number);
            let hour24 = hours;
            if (period === 'PM' && hours !== 12) hour24 += 12;
            if (period === 'AM' && hours === 12) hour24 = 0;
            return { hour24, minutes };
          };

          const startParsed = parseTime(data.startTime);
          const startDate = new Date(data.date);
          startDate.setHours(startParsed.hour24, startParsed.minutes, 0, 0);

          let endTimeStr: string | undefined;
          if (data.endTime) {
            const endParsed = parseTime(data.endTime);
            const endDate = new Date(data.date);
            endDate.setHours(endParsed.hour24, endParsed.minutes, 0, 0);
            endTimeStr = endDate.toISOString();
          }

          createAppointment(
            {
              patientId: response.patient?.id || '',
              isImmediate: false,
              startTime: startDate.toISOString(),
              endTime: endTimeStr,
            },
            {
              onSuccess: () => {
                setIsSuccessOpen(true);
              },
              onError: (error) => {
                toast.error(
                  getErrorMessage(
                    error,
                    'Patient invited, but failed to schedule appointment.'
                  )
                );
                setIsSuccessOpen(true);
              },
            }
          );
        } else {
          setIsSuccessOpen(true);
        }
      },
      onError: (error) => {
        toast.error(
          getErrorMessage(error, 'Failed to send invitation. Please try again.')
        );
      },
    });
  };

  const handleAddAnother = () => {
    form.reset({
      email: '',
      phone: '',
      includeAppointment: false,
      date: undefined,
      startTime: '',
      endTime: '',
    });
    setIsSuccessOpen(false);
    setSubmittedEmail('');
    setInviteLink(undefined);
  };

  const handleCloseSuccess = () => {
    setIsSuccessOpen(false);
  };

  return {
    form,
    register: form.register,
    control: form.control,
    handleSubmit: form.handleSubmit(onSubmit),
    formState: form.formState,
    errors: form.formState.errors,
    includeAppointment,
    date,
    isSuccessOpen,
    submittedEmail,
    inviteLink,
    isPending,
    handleAddAnother,
    handleCloseSuccess,
    startTime,
  };
}
