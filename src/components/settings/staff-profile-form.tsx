'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SettingsPageHeader from './settings-page-header';
import { Spinner } from '@/components/ui/spinner';
import {
  emptyStaffProfile,
  type StaffProfile,
  type StaffRole,
} from '@/stores/staff-profile-store';
import { useUploadFile } from '@/integration/files/mutations';
import {
  patchDoctorProfile,
  patchHealthAssistantProfile,
} from '@/integration/settings/api';
import { getErrorMessage } from '@/integration';
import { DOCTOR_PROFILE_QUERY_KEY } from '@/integration/doctor/queries/use-doctor-profile';
import { HEALTH_ASSISTANT_QUERY_KEYS } from '@/integration/health-assistant/query-keys';

const FIELD_CLASS = 'h-11';

type ProfileField = {
  name: keyof StaffProfile;
  label: string;
  doctorOnly?: boolean;
  span?: 2;
};

const FIELDS: ProfileField[] = [
  { name: 'firstName', label: 'First name' },
  { name: 'lastName', label: 'Last name' },
  { name: 'title', label: 'Professional title' },
  { name: 'specialty', label: 'Specialty', doctorOnly: true },
  {
    name: 'clinicName',
    label: 'Clinic / practice name',
    doctorOnly: true,
    span: 2,
  },
  { name: 'address', label: 'Street address', span: 2 },
  { name: 'city', label: 'City / town' },
  { name: 'state', label: 'Region' },
  { name: 'zip', label: 'GhanaPost GPS / postal code', span: 2 },
  { name: 'npi', label: 'MDC registration number', doctorOnly: true },
  {
    name: 'licenseNumber',
    label: 'Professional licence number',
    doctorOnly: true,
  },
];

function initialsFrom(profile: Partial<StaffProfile>) {
  const first = profile.firstName?.trim()?.[0] || '';
  const last = profile.lastName?.trim()?.[0] || '';
  return `${first}${last}`.toUpperCase() || 'U';
}

export default function StaffProfileForm({
  role,
  defaults,
}: {
  role: StaffRole;
  userId: string;
  defaults?: Partial<StaffProfile>;
}) {
  const queryClient = useQueryClient();
  const upload = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(defaults?.avatarUrl || '');

  const { register, handleSubmit, reset, control, getValues, watch } =
    useForm<StaffProfile>({
      defaultValues: { ...emptyStaffProfile(), ...defaults },
    });

  const watchedNames = watch(['firstName', 'lastName']);
  const initials = useMemo(
    () =>
      initialsFrom({
        firstName: watchedNames[0] || defaults?.firstName,
        lastName: watchedNames[1] || defaults?.lastName,
      }),
    [watchedNames, defaults?.firstName, defaults?.lastName]
  );

  useEffect(() => {
    reset({
      ...emptyStaffProfile(),
      ...defaults,
      firstName: defaults?.firstName || '',
      lastName: defaults?.lastName || '',
      phone: defaults?.phone || '',
      avatarUrl: defaults?.avatarUrl || '',
    });
    setAvatarUrl(defaults?.avatarUrl || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    defaults?.firstName,
    defaults?.lastName,
    defaults?.phone,
    defaults?.avatarUrl,
    defaults?.title,
    defaults?.specialty,
    defaults?.clinicName,
    defaults?.address,
    defaults?.city,
    defaults?.state,
    defaults?.zip,
    defaults?.npi,
    defaults?.licenseNumber,
    reset,
  ]);

  const syncProfileCache = (updated: Record<string, unknown>) => {
    if (role === 'doctor') {
      queryClient.setQueryData(DOCTOR_PROFILE_QUERY_KEY, (current: unknown) => {
        if (!current || typeof current !== 'object') return updated;
        return { ...current, ...updated };
      });
    } else {
      queryClient.setQueryData(
        HEALTH_ASSISTANT_QUERY_KEYS.PROFILE,
        (current: unknown) => {
          if (!current || typeof current !== 'object') return updated;
          return { ...current, ...updated };
        }
      );
    }
  };

  const invalidateProfile = async () => {
    if (role === 'doctor') {
      await queryClient.invalidateQueries({
        queryKey: DOCTOR_PROFILE_QUERY_KEY,
      });
    } else {
      await queryClient.invalidateQueries({
        queryKey: HEALTH_ASSISTANT_QUERY_KEYS.PROFILE,
      });
    }
  };

  const patchProfile = async (
    data: Partial<StaffProfile> & { phoneNumber?: string; avatarUrl?: string }
  ) => {
    if (role === 'doctor') {
      return patchDoctorProfile(data);
    }
    return patchHealthAssistantProfile(data);
  };

  const onAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }

    try {
      const uploaded = await upload.mutateAsync(file);
      const nextUrl = uploaded.url;
      if (!nextUrl) {
        toast.error('Upload succeeded but no image URL was returned');
        return;
      }

      setAvatarUrl(nextUrl);
      const updated = (await patchProfile({
        avatarUrl: nextUrl,
        phoneNumber: getValues('phone') || defaults?.phone,
      })) as Record<string, unknown>;
      syncProfileCache({ ...updated, avatarUrl: nextUrl });
      await invalidateProfile();
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update profile photo'));
    }
  };

  const onSubmit = async (data: StaffProfile) => {
    setSaving(true);
    try {
      const updated = (await patchProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        title: data.title,
        specialty: data.specialty,
        clinicName: data.clinicName,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        npi: data.npi,
        licenseNumber: data.licenseNumber,
        phoneNumber: data.phone,
        avatarUrl: avatarUrl || undefined,
      })) as Record<string, unknown>;
      syncProfileCache({
        ...updated,
        avatarUrl: avatarUrl || (updated.avatarUrl as string) || '',
      });
      await invalidateProfile();
      toast.success('Profile saved');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save profile'));
    } finally {
      setSaving(false);
    }
  };

  const visibleFields = FIELDS.filter(
    (field) => role === 'doctor' || !field.doctorOnly
  );

  return (
    <div className="space-y-8">
      <SettingsPageHeader
        title={role === 'doctor' ? 'Profile & practice' : 'Profile'}
        description={
          role === 'doctor'
            ? 'Personal details and practice information patients see on Carelio.'
            : 'Update your name and contact details.'
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <section className="rounded-[20px] border border-(--border-stroke) p-6">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <Avatar className="size-20 border border-(--border-stroke)">
                <AvatarImage
                  key={avatarUrl || 'empty'}
                  src={avatarUrl || undefined}
                  alt="Profile photo"
                />
                <AvatarFallback className="bg-brand-blue/10 text-brand-blue text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={upload.isPending}
                className="absolute -bottom-0.5 -right-0.5 flex size-8 items-center justify-center rounded-full border border-(--border-stroke) bg-bg-white-0 text-(--text-secondary) shadow-sm hover:text-(--text-primary) disabled:opacity-60"
                aria-label="Change profile photo"
              >
                {upload.isPending ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <Camera className="size-3.5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onAvatarChange}
              />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-(--text-primary)">
                Profile photo
              </p>
              <p className="text-sm text-(--text-secondary)">
                Click the camera to upload a new photo. It saves right away.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-2 h-9 rounded-full px-4"
                disabled={upload.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                {upload.isPending ? 'Uploading…' : 'Change photo'}
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-(--border-stroke) p-6 space-y-4">
          <h2 className="text-base font-semibold text-(--text-primary)">
            Details
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visibleFields.map((field) => (
              <div
                key={field.name}
                className={`flex flex-col gap-1.5 ${
                  field.span === 2 ? 'sm:col-span-2' : ''
                }`}
              >
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  {...register(field.name)}
                  className={FIELD_CLASS}
                />
              </div>
            ))}

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="phone">Phone</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    defaultCountry="GH"
                    value={field.value || ''}
                    onChange={(value) => field.onChange(value || '')}
                    placeholder="+233 24 000 0000"
                    className="w-full"
                    inputClassName={FIELD_CLASS}
                    countryButtonClassName="bg-transparent border-(--border-light) hover:bg-transparent"
                  />
                )}
              />
            </div>
          </div>
        </section>

        <div>
          <Button
            type="submit"
            variant="brand"
            className="rounded-full px-6"
            disabled={saving || upload.isPending}
          >
            {saving ? <Spinner /> : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
