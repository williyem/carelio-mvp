/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

const getAddPatientSchema = (optionalEmail: boolean = false) =>
  z.object({
    fullName: z.string().min(1, 'Full name is required'),
    dateOfBirth: z.date({
      error: 'Date of birth is required',
    }),
    gender: z.string().min(1, 'Gender is required'),
    email: optionalEmail
      ? z
          .string()
          .email('Please enter a valid email address')
          .optional()
          .or(z.literal(''))
      : z
          .string()
          .min(1, 'Email is required')
          .email('Please enter a valid email address'),
    phoneNumber: z
      .string()
      .min(1, 'Phone number is required')
      .refine(
        (value) => isValidPhoneNumber(value || ''),
        'Please enter a valid phone number'
      ),
    address: z.string().min(1, 'Address is required'),
    bloodType: z.string().optional(),
  });

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const BLOOD_TYPE_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

export { GENDER_OPTIONS, BLOOD_TYPE_OPTIONS };
export type AddPatientFormData = z.infer<
  ReturnType<typeof getAddPatientSchema>
>;

interface UseAddPatientFormProps {
  onSubmit: (data: AddPatientFormData) => void | Promise<void>;
  isPending?: boolean;
  optionalEmail?: boolean;
  defaultValues?: Partial<AddPatientFormData>;
}

export function useAddPatientForm({
  onSubmit,
  isPending = false,
  optionalEmail = false,
  defaultValues,
}: UseAddPatientFormProps) {
  const form = useForm<AddPatientFormData>({
    resolver: zodResolver(getAddPatientSchema(optionalEmail)),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      dateOfBirth: undefined,
      gender: '',
      email: '',
      phoneNumber: '',
      address: '',
      bloodType: '',
      ...defaultValues,
    } as any,
  });

  const onSubmitForm = async (data: AddPatientFormData) => {
    await onSubmit(data);
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmitForm),
    formState: form.formState,
    control: form.control,
    reset: form.reset,
    isPending,
  };
}
