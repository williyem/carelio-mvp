'use client';

import DoctorBillingSettings from '@/components/settings/doctor-billing-settings';
import useUser from '@/hooks/useUser';
import { Spinner } from '@/components/ui/spinner';

export default function DoctorBillingPage() {
  const { userId, isLoading } = useUser();

  if (isLoading || !userId) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return <DoctorBillingSettings doctorId={userId} />;
}
