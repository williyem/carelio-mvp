'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { ROUTES } from '@/lib/routes';
import BackButton from '@/components/dashboard/back-button';
import PatientDetailsHeader from '@/components/dashboard/patient-details-header';
import PatientInfoCard from '@/components/dashboard/patient-info-card';
import PatientInfoCardSkeleton from '@/components/dashboard/patient-info-card-skeleton';
import AppointmentsList from '@/components/dashboard/appointments-list';
import PatientVerificationDialog from '@/components/dashboard/patient-verification-dialog';
import RecordsLockedCard from '@/components/dashboard/records-locked-card';
import useGetPatientByIdQuery from '@/integration/patient/queries/useGetPatientById';
import { isForbiddenError } from '@/integration';
import { formatDateOfBirth, genderMap } from '@/lib/easy';
import { usePatientVerificationStore } from '@/stores/patient-verifcation-store';
import { Info } from 'lucide-react';

const PatientDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const { setSelectedPatient } = usePatientVerificationStore();

  const {
    patient: fetchedPatient,
    isLoading: isPatientLoading,
    isError,
    error,
  } = useGetPatientByIdQuery(patientId, 'health-assistant');

  const recordsLocked = isError && isForbiddenError(error);

  const handleBack = () => {
    router.push(ROUTES.HEALTH_ASSISTANT.PATIENT.ROOT);
  };

  const openVerify = () => {
    setSelectedPatient({
      id: patientId,
      fullName: fetchedPatient?.fullName || 'this patient',
      email: fetchedPatient?.email || '',
    });
    setShowVerificationDialog(true);
  };

  const patient = useMemo(() => {
    if (!fetchedPatient) {
      return {
        id: '',
        patientId: patientId || '',
        name: '',
        dateOfBirth: '',
        gender: 'Other' as const,
        bloodType: '',
        email: '',
        phone: '',
        address: '',
        isRegistrationComplete: false,
      };
    }

    return {
      id: fetchedPatient.id,
      name: fetchedPatient.fullName,
      patientId: fetchedPatient.patientId,
      dateOfBirth: formatDateOfBirth(fetchedPatient.dob),
      gender: genderMap[fetchedPatient.gender] || 'Other',
      bloodType: fetchedPatient.bloodType,
      email: fetchedPatient.email,
      phone: fetchedPatient.phoneNumber,
      address: fetchedPatient.address,
      allergies: fetchedPatient.allergies,
      medications: fetchedPatient.medications,
      conditions: fetchedPatient.conditions,
      emergencyContact: fetchedPatient.emergencyContact,
      isRegistrationComplete: fetchedPatient.isRegistrationComplete,
    };
  }, [fetchedPatient, patientId]);

  return (
    <div className="flex flex-col gap-5 items-start w-[900px] max-w-full mx-auto">
      <BackButton onClick={handleBack} />
      {recordsLocked ? (
        <RecordsLockedCard onVerify={openVerify} />
      ) : (
        <>
          <PatientDetailsHeader
            patientId={patient.id}
            patient={patient}
            portal="health-assistant"
          />
          {!isPatientLoading && !patient?.isRegistrationComplete && (
            <div className="theme-alert-warning w-full my-2 rounded-2xl p-5 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="h-10 w-10 rounded-full bg-(--bg-white) border border-state-warning-base/35 flex items-center justify-center shrink-0 ">
                <Info className="h-5 w-5 text-amber-600" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[15px] font-bold">
                  Registration Incomplete
                </h4>
                <p className="text-sm text-amber-900">
                  The patient has not completed registration and is yet to sign
                  consent form
                </p>
              </div>
            </div>
          )}

          {isPatientLoading ? (
            <PatientInfoCardSkeleton />
          ) : (
            <PatientInfoCard patient={patient} />
          )}
          <div className="w-full mt-2">
            <AppointmentsList patient={patient} portal="health-assistant" />
          </div>
        </>
      )}
      <PatientVerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        portal="health-assistant"
      />
    </div>
  );
};

export default PatientDetailsPage;
