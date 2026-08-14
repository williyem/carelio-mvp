'use client';

import PatientInsuranceSettings from '@/components/settings/patient-insurance-settings';
import { usePatientSession } from '@/integration/auth/patient';
import { Spinner } from '@/components/ui/spinner';

export default function PatientInsurancePage() {
  const { data, isLoading } = usePatientSession();
  const patientId = data?.user?.id;

  if (isLoading || !patientId) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return <PatientInsuranceSettings />;
}
