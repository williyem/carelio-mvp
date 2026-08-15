/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConsentFormWrapper } from './ConsentFormWrapper';
import { usePatientInviteStore } from '@/stores/patient-invite-store';
import { Checkbox } from '@/components/ui/checkbox';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebouncedSignatureGeneration } from '@/lib/signatureGenerator';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const locationSchema = z.object({
  locationForToday: z.string().min(1, 'Location is required'),
  cityStateZip: z.string().min(1, 'City/State/Zip is required'),
  locationType: z.enum(['home', 'clinic', 'school', 'workplace', 'other']),
  name: z.string().min(2, 'Printed name is required'),
  agreement: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the electronic signature consent',
  }),
  date: z.string().min(1, 'Date is required'),
  signature: z.string().optional(),
});

type LocationForm = z.infer<typeof locationSchema>;

export default function TelehealthLocationStep() {
  const { updateFormData, formData, nextStep } = usePatientInviteStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LocationForm>({
    resolver: zodResolver(locationSchema),
    mode: 'onChange',
    defaultValues: {
      locationForToday: formData.locationForToday || '',
      cityStateZip: formData.cityStateZip || '',
      locationType: (formData.locationType as any) || 'home',
      name: formData.fullName || '',
      agreement: false,
      date: new Date().toLocaleDateString('en-CA'),
      signature: '',
    },
  });

  // Watch for changes and sync with store?
  // Ideally, if the user edits the name here, it should update global state IF we want that behavior.
  // For now, let's just make sure it initializes correctly and updates on submit.

  const watchedName = watch('name');

  // Update store when specific fields change to keep consistency if the user navigates back/forth?
  // Or just rely on onSubmit. The request said "Ideally, updating it in one place updates all instances."
  // So we should update the store as they type or on blur.

  // Let's rely on onSubmit for "saving" to keep it simple, but we could use a useEffect to sync name back to store if needed.
  // Actually, if they edit name here, it's just for the signature.
  // But the request says "carry over all patient intials and Printed name... updating it in one place updates all instances."

  // So let's sync local changes to store debounced or on change.
  useEffect(() => {
    if (watchedName && watchedName !== formData.fullName) {
      updateFormData({ fullName: watchedName, printedName: watchedName });
    }
  }, [watchedName]);
  const watchedAgreement = watch('agreement');

  useDebouncedSignatureGeneration(
    watchedName,
    watchedAgreement,
    setValue,
    'signature'
  );

  const onSubmit = (data: LocationForm) => {
    updateFormData({
      locationForToday: data.locationForToday,
      cityStateZip: data.cityStateZip,
      locationType: data.locationType,
      patientSignature: data.name,
      date: data.date,
    });
    nextStep();
  };

  return (
    <ConsentFormWrapper
      title="2. Telehealth Location Verification"
      onNext={handleSubmit(onSubmit)}
      hideNext
    >
      <div className="space-y-6 text-left">
        <p className="text-[14px] leading-relaxed text-text-strong-950">
          I agree to share my location at the start of every telehealth visit.
          If my location changes during the visit, I will tell my provider. I
          understand that my location may be used to get help to me in an
          emergency.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="locationForToday">Location for today’s visit</Label>
            <Input
              id="locationForToday"
              {...register('locationForToday')}
              placeholder="e.g. My home"
              className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
            />
            {errors.locationForToday && (
              <p className="text-red-600 text-xs">
                {errors.locationForToday.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cityStateZip">City/State/Zip</Label>
            <Input
              id="cityStateZip"
              {...register('cityStateZip')}
              className="bg-transparent border-(--border-light) h-[44px] rounded-[8px] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
              placeholder="City, State, Zip"
            />
            {errors.cityStateZip && (
              <p className="text-red-600 text-xs">
                {errors.cityStateZip.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="locationType">Type of location</Label>
          <Controller
            name="locationType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="h-[42px]! max-sm:text-base">
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="workplace">Workplace</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-4 mt-6 w-full pt-4 border-t border-(--border-stroke)">
          <div>
            <div className="typography-paragraph-medium font-normal mb-1">
              Printed Name:
            </div>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Printed Name"
                  className="border-0 border-b-2 border-dotted border-(--border-gray) w-full max-w-[300px] outline-none bg-transparent text-base mb-2"
                />
              )}
            />
            {errors.name && (
              <div className="text-red-600 text-xs">{errors.name.message}</div>
            )}
          </div>

          <div>
            <Controller
              name="agreement"
              control={control}
              render={({ field: { value, onChange } }) => (
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="location-agreement"
                    checked={value}
                    onCheckedChange={onChange}
                    className="size-4 mt-0.5"
                  />
                  <label
                    htmlFor="location-agreement"
                    className="typography-paragraph-small text-text-strong-950 leading-normal cursor-pointer"
                  >
                    I agree to electronically sign this document using my
                    printed name above
                  </label>
                </div>
              )}
            />
            {errors.agreement && (
              <div className="text-red-600 text-xs">
                {errors.agreement.message}
              </div>
            )}
          </div>

          <div>
            <div className="typography-paragraph-medium font-normal mb-1">
              Signature:
            </div>
            <div
              className="border-b-2 border-dotted border-(--border-gray) w-full max-w-[300px] h-[60px] relative mb-2 min-w-[200px] flex items-center"
              data-ph-mask="signature-area"
            >
              <Controller
                name="signature"
                control={control}
                render={({ field: { value } }) => (
                  <div
                    className="w-full h-full relative"
                    data-ph-mask="signature-container"
                  >
                    {value && value.startsWith('data:image') ? (
                      <Image
                        src={value}
                        alt="Generated signature"
                        width={300}
                        height={80}
                        className="w-full h-[60px] object-contain absolute left-0 top-0 rounded-[4px]"
                        data-ph-mask="signature-display"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-(--text-muted) text-sm">
                        Signature will appear here
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          <div>
            <div className="typography-paragraph-medium font-normal mb-1">
              Date:
            </div>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  readOnly={true}
                  className="border-0 border-b-2 border-dotted border-(--border-gray) w-full max-w-[300px] outline-none bg-transparent text-base mb-2"
                />
              )}
            />
            {errors.date && (
              <div className="text-red-600 text-xs">{errors.date.message}</div>
            )}
          </div>
        </div>
      </div>
      <Button
        variant="brand"
        className="w-full h-[46px] mt-2 text-sm"
        onClick={handleSubmit(onSubmit)}
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting && <Spinner className="mr-2" />}
        Agree and Continue
      </Button>
    </ConsentFormWrapper>
  );
}
