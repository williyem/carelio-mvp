'use client';

import StaffProfileForm from '@/components/settings/staff-profile-form';
import useUser from '@/hooks/use-user';
import { Spinner } from '@/components/ui/spinner';

export default function HaProfileSettingsPage() {
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
      role="health-assistant"
      userId={userId}
      defaults={{
        firstName: user?.firstName,
        lastName: user?.lastName,
        phone: user?.phoneNumber,
      }}
    />
  );
}
