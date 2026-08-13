'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsPageHeader from './settings-page-header';
import {
  emptyStaffProfile,
  useStaffProfileStore,
  type StaffProfile,
  type StaffRole,
} from '@/stores/staff-profile-store';

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
  userId,
  defaults,
}: {
  role: StaffRole;
  userId: string;
  defaults?: Partial<StaffProfile>;
}) {
  const getProfile = useStaffProfileStore((s) => s.getProfile);
  const setProfile = useStaffProfileStore((s) => s.setProfile);
  const [hydrated, setHydrated] = useState(false);

  const { register, handleSubmit, reset } = useForm<StaffProfile>({
    defaultValues: { ...emptyStaffProfile(), ...defaults },
  });

  useEffect(() => {
    const stored = getProfile(role, userId);
    reset({
      ...emptyStaffProfile(),
      ...defaults,
      ...stored,
      firstName: stored.firstName || defaults?.firstName || '',
      lastName: stored.lastName || defaults?.lastName || '',
      phone: stored.phone || defaults?.phone || '',
    });
    setHydrated(true);
    // defaults are primitive snapshots from the session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProfile, reset, role, userId]);

  const onSubmit = (data: StaffProfile) => {
    setProfile(role, userId, data);
    toast.success('Profile saved');
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
        {FIELDS.filter((field) => role === 'doctor' || !field.doctorOnly).map(
          (field) => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                {...register(field.name)}
                disabled={!hydrated}
                className="h-11"
              />
            </div>
          )
        )}
        <div className="sm:col-span-2 pt-2">
          <Button type="submit" variant="brand" className="rounded-full px-6">
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
