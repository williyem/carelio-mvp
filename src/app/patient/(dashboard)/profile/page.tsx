'use client';

import { useEffect } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import ErrorMessage from '@/components/ui/error-message';
import BackButton from '@/components/dashboard/back-button';
import PatientInfoCard from '@/components/dashboard/patient-info-card';
import { Spinner } from '@/components/ui/spinner';
import { ROUTES } from '@/lib/routes';
import {
  PATIENT_SESSION_QUERY_KEY,
  usePatientSession,
} from '@/integration/auth/patient';
import {
  getPatientProfile,
  patchPatientProfile,
} from '@/integration/settings/api';
import { formatAppointmentDate } from '@/lib/easy';
import {
  clinicalReviewStorageKey,
  formatCommaSeparatedList,
  parseCommaSeparatedList,
} from '@/lib/patient-clinical';
import { Patient } from '@/types/patient.types';
import { toast } from 'sonner';
import { getErrorMessage } from '@/integration';

const healthSchema = z.object({
  allergies: z.string().optional(),
  conditions: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z
    .string()
    .refine(
      (value) => !value || isValidPhoneNumber(value || ''),
      'Please enter a valid phone number'
    )
    .optional()
    .or(z.literal('')),
});

type HealthFormData = z.infer<typeof healthSchema>;

function mapGender(gender: string | undefined): Patient['gender'] {
  const value = (gender ?? '').toLowerCase();
  if (value === 'female') return 'Female';
  if (value === 'other') return 'Other';
  return 'Male';
}

export default function PatientProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = usePatientSession();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['patient', 'profile'],
    queryFn: getPatientProfile,
  });

  const {
    handleSubmit,
    register,
    control,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<HealthFormData>({
    resolver: zodResolver(healthSchema),
    mode: 'onChange',
    defaultValues: {
      allergies: '',
      conditions: '',
      emergencyName: '',
      emergencyPhone: '',
    },
  });

  useEffect(() => {
    if (!profile) return;
    setValue('allergies', formatCommaSeparatedList(profile.allergies));
    setValue('conditions', formatCommaSeparatedList(profile.conditions));
    setValue('emergencyName', profile.emergencyContact?.name || '');
    setValue('emergencyPhone', profile.emergencyContact?.phone || '');
  }, [profile, setValue]);

  const user = session?.user;
  const source = profile || user;
  const dobValue = profile?.dob || profile?.dateOfBirth || user?.dob || '';
  const patient: Patient | undefined = source
    ? {
        id: source.id || user?.id || '',
        name: source.fullName || user?.fullName || 'Patient',
        fullName: source.fullName || user?.fullName,
        dateOfBirth: formatAppointmentDate(dobValue) || dobValue,
        gender: mapGender(source.gender || user?.gender),
        bloodType: source.bloodType || user?.bloodType,
        email: source.email || user?.email || '',
        phone: profile?.phone || profile?.phoneNumber || user?.phoneNumber,
        phoneNumber:
          profile?.phoneNumber || profile?.phone || user?.phoneNumber,
        address: source.address || user?.address,
        patientId: source.patientId || user?.patientId || user?.id || '',
        isRegistrationComplete: Boolean(user?.isRegistrationComplete),
      }
    : undefined;

  const onSubmit = async (data: HealthFormData) => {
    if (!user?.id) {
      toast.error('Sign in again to update your information');
      return;
    }
    try {
      await patchPatientProfile({
        allergies: parseCommaSeparatedList(data.allergies || ''),
        conditions: parseCommaSeparatedList(data.conditions || ''),
        emergencyContact: {
          name: data.emergencyName?.trim() || '',
          phone: data.emergencyPhone?.trim() || '',
          relationship: profile?.emergencyContact?.relationship || '',
        },
      });
      window.localStorage.setItem(clinicalReviewStorageKey(user.id), '1');
      await queryClient.invalidateQueries({
        queryKey: PATIENT_SESSION_QUERY_KEY,
      });
      await queryClient.invalidateQueries({ queryKey: ['patient', 'profile'] });
      toast.success('Information saved');
      router.push(ROUTES.PATIENT.ROOT);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save your information'));
    }
  };

  if (isLoading || !patient) {
    return (
      <div className="flex justify-center pt-20 w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[15px] items-start pt-4 sm:pt-10 px-4 sm:px-0 w-full max-w-[900px] mx-auto">
      <BackButton onClick={() => router.push(ROUTES.PATIENT.ROOT)} />

      <div className="flex flex-col gap-[20px] items-start w-full">
        <div className="flex flex-col gap-2 items-start w-full">
          <h1 className="font-bold leading-[1.2] text-(--text-primary) text-[20px] sm:text-[24px]">
            My information
          </h1>
          <p className="text-(--text-secondary) text-[14px]">
            These are the details from when you signed up.
          </p>
        </div>

        <PatientInfoCard patient={patient} showClinical={false} />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-[20px] items-start w-full"
        >
          <div className="flex flex-col gap-2 items-start w-full">
            <h2 className="font-bold text-(--text-primary) text-[18px]">
              For your doctor
            </h2>
            <p className="text-(--text-secondary) text-[14px]">
              Allergies, conditions you have now or have been treated for, and
              an emergency contact stay useful on every visit.
            </p>
          </div>

          <div className="flex flex-col gap-2 items-start w-full">
            <Label className="font-medium leading-[20px] text-(--text-label) text-[14px]">
              Allergies
            </Label>
            <Input
              placeholder="e.g., Penicillin, Peanuts"
              className="h-[48px] bg-white"
              {...register('allergies')}
            />
            <p className="text-(--text-secondary) text-[12px]">
              Separate with commas. Write None if you have none.
            </p>
          </div>

          <div className="flex flex-col gap-2 items-start w-full">
            <Label className="font-medium leading-[20px] text-(--text-label) text-[14px]">
              Medical conditions
            </Label>
            <Input
              placeholder="e.g., Asthma, Hypertension"
              className="h-[48px] bg-white"
              {...register('conditions')}
            />
            <p className="text-(--text-secondary) text-[12px]">
              Current or past conditions you have been treated for. Separate
              with commas.
            </p>
          </div>

          <div className="flex flex-col gap-2 items-start w-full">
            <Label className="font-medium leading-[20px] text-(--text-label) text-[14px]">
              Emergency contact name
            </Label>
            <Input
              placeholder="Full name"
              className="h-[48px] bg-white"
              {...register('emergencyName')}
            />
          </div>

          <div className="flex flex-col gap-2 items-start w-full">
            <Label
              htmlFor="emergencyPhone"
              className="font-medium leading-[20px] text-(--text-label) text-[14px]"
            >
              Emergency contact phone
            </Label>
            <Controller
              name="emergencyPhone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  defaultCountry="GH"
                  value={field.value || ''}
                  disabled={isSubmitting}
                  onChange={field.onChange}
                  placeholder="+233 24 000 0000"
                  className="w-full"
                  inputClassName="bg-white border-(--border-light) h-[44px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
                  countryButtonClassName="bg-white border-(--border-light) hover:bg-white"
                />
              )}
            />
            <ErrorMessage message={errors.emergencyPhone?.message} />
          </div>

          <Button
            type="submit"
            variant="brand"
            disabled={isSubmitting}
            className="w-full h-[50px] rounded-[100px] px-4 py-[10px] text-[14px] font-normal leading-[1.2]"
          >
            {isSubmitting ? <Spinner /> : 'Save'}
          </Button>
        </form>
      </div>
    </div>
  );
}
