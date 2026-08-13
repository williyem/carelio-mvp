'use client';

import PatientBillingSettings from '@/components/settings/patient-billing-settings';
import { usePatientSession } from '@/integration/auth/patient';
import { Spinner } from '@/components/ui/spinner';

export default function PatientBillingPage() {
  const { data, isLoading } = usePatientSession();
  const patientId = data?.user?.id;

  if (isLoading || !patientId) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return <PatientBillingSettings patientId={patientId} />;
}
