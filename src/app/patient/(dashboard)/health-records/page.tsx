'use client';

import { useMemo } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { ROUTES } from '@/lib/routes';
import BackButton from '@/components/dashboard/back-button';
import HealthRecordsList from '@/components/dashboard/health-records-list';
import { HealthRecord } from '@/types/health-records.types';
import { usePatientSession } from '@/integration/auth/patient';
import { useGetMyPatientAppointments } from '@/integration/appointments';
import { formatAppointmentDate, getFullNameFromUser } from '@/lib/easy';
import { Spinner } from '@/components/ui/spinner';

const HealthRecordsPage = () => {
  const router = useRouter();
  const { data: session, isLoading: isSessionLoading } = usePatientSession();
  const patientMongoId = session?.user?.id;

  const { appointments, isLoading: isAppointmentsLoading } =
    useGetMyPatientAppointments(patientMongoId, 'COMPLETED', !!patientMongoId);

  const handleBack = () => {
    router.push(ROUTES.PATIENT.ROOT);
  };

  const handleRecordClick = (recordId: string) => {
    router.push(ROUTES.PATIENT.RECORD_DETAILS(recordId));
  };

  const healthRecords: HealthRecord[] = useMemo(
    () =>
      appointments.map((apt) => ({
        id: apt.id,
        patientName: apt.doctor
          ? getFullNameFromUser(apt.doctor)
          : 'Consultation',
        date:
          formatAppointmentDate(apt.startTime) ||
          formatAppointmentDate(apt.createdAt) ||
          'Date unavailable',
      })),
    [appointments]
  );

  return (
    <div className="flex flex-col gap-[15px] items-start pt-4 sm:pt-10 px-4 sm:px-0 w-full max-w-[900px] mx-auto">
      <BackButton onClick={handleBack} />

      <div className="flex flex-col gap-5 items-start w-full">
        <h1 className="font-bold leading-[1.2] text-(--text-primary)   text-[20px] sm:text-[24px]">
          Health Records
        </h1>

        {isSessionLoading || isAppointmentsLoading ? (
          <div className="flex items-center justify-center py-16 w-full">
            <Spinner />
          </div>
        ) : (
          <HealthRecordsList
            records={healthRecords}
            onRecordClick={handleRecordClick}
          />
        )}
      </div>
    </div>
  );
};

export default HealthRecordsPage;
