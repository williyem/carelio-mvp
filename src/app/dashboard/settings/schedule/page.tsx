'use client';

import ScheduleAvailabilitySettings from '@/components/settings/schedule-availability-settings';
import useUser from '@/hooks/useUser';
import { Spinner } from '@/components/ui/spinner';

export default function DoctorScheduleSettingsPage() {
  const { userId, isLoading } = useUser();

  if (isLoading || !userId) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return <ScheduleAvailabilitySettings doctorId={userId} />;
}
