'use client';

import StaffProfileForm from '@/components/settings/staff-profile-form';
import useUser from '@/hooks/useUser';
import { Spinner } from '@/components/ui/spinner';

export default function DoctorProfileSettingsPage() {
  const { user, userId, isLoading } = useUser();

  if (isLoading || !userId) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <StaffProfileForm
      role="doctor"
      userId={userId}
      defaults={{
        firstName: user?.firstName,
        lastName: user?.lastName,
        phone: user?.phone || user?.phoneNumber,
        title: user?.title,
        specialty: user?.specialty,
        clinicName: user?.clinicName,
        address: user?.address,
        city: user?.city,
        state: user?.state,
        zip: user?.zip,
        timezone: user?.timezone,
        npi: user?.npi,
        licenseNumber: user?.licenseNumber,
        avatarUrl: user?.avatarUrl,
      }}
    />
  );
}
