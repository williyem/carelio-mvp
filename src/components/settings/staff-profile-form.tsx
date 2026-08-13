'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const FIELDS: {
  name: keyof StaffProfile;
  label: string;
  doctorOnly?: boolean;
}[] = [
  { name: 'firstName', label: 'First name' },
  { name: 'lastName', label: 'Last name' },
  { name: 'title', label: 'Title' },
  { name: 'specialty', label: 'Specialty', doctorOnly: true },
  { name: 'clinicName', label: 'Clinic / practice name', doctorOnly: true },
  { name: 'phone', label: 'Phone' },
  { name: 'address', label: 'Street address' },
  { name: 'city', label: 'City' },
  { name: 'state', label: 'State' },
  { name: 'zip', label: 'ZIP' },
  { name: 'timezone', label: 'Timezone' },
  { name: 'npi', label: 'NPI', doctorOnly: true },
  { name: 'licenseNumber', label: 'License number', doctorOnly: true },
];

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
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(defaults?.avatarUrl || '');

  const { register, handleSubmit, reset } = useForm<StaffProfile>({
    defaultValues: { ...emptyStaffProfile(), ...defaults },
  });

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
    reset,
  ]);

  const onSubmit = async (data: StaffProfile) => {
    setSaving(true);
    try {
      const payload = { ...data, avatarUrl, phoneNumber: data.phone };
      if (role === 'doctor') {
        await patchDoctorProfile(payload);
        await queryClient.invalidateQueries({
          queryKey: DOCTOR_PROFILE_QUERY_KEY,
        });
      } else {
        await patchHealthAssistantProfile(payload);
        await queryClient.invalidateQueries({
          queryKey: HEALTH_ASSISTANT_QUERY_KEYS.PROFILE,
        });
      }
      toast.success('Profile saved');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save profile'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SettingsPageHeader
        title={role === 'doctor' ? 'Profile & practice' : 'Profile'}
        description={
          role === 'doctor'
            ? 'Personal details and practice information patients see on Carelio.'
            : 'Update your name and contact details.'
        }
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2 flex items-center gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Profile"
              className="size-16 rounded-full object-cover border border-(--border-stroke)"
            />
          ) : (
            <div className="size-16 rounded-full bg-brand-blue/10" />
          )}
          <div>
            <Label htmlFor="avatar">Profile picture</Label>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              className="mt-1"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  const uploaded = await upload.mutateAsync(file);
                  setAvatarUrl(uploaded.url);
                  toast.success('Photo uploaded');
                } catch (error) {
                  toast.error(getErrorMessage(error, 'Upload failed'));
                }
              }}
            />
          </div>
        </div>
        {FIELDS.filter((field) => role === 'doctor' || !field.doctorOnly).map(
          (field) => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                {...register(field.name)}
                className="h-11"
              />
            </div>
          )
        )}
        <div className="sm:col-span-2 pt-2">
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
