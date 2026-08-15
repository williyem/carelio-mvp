'use client';

import { useState, Suspense } from 'react';
import DataTable from '@/components/ui/table/data-table';
import useAppointmentsCols from '@/components/dashboard/appointments-columns';
import AppointmentsStats from '@/components/dashboard/appointments-stats';
import AppointmentsStatsSkeleton from '@/components/skeletons/appointments-stats-skeleton';
import PatientSearchInput from '@/components/dashboard/patient-search-input';
import PatientVerificationDialog from '@/components/dashboard/patient-verification-dialog';
import useGetAssignmentPatients from '@/hooks/page-hooks/assignments/useGetAssignmentPatients';
import useGetHealthAssistantStats from '@/integration/health-assistant/queries/useGetHealthAssistantStats';
import { PatientRow } from '@/integration/health-assistant/types';
import { toVerificationPatient } from '@/lib/easy';
import { ROUTES } from '@/lib/routes';
import { usePatientVerificationStore } from '@/stores/patient-verifcation-store';
import { useRouter } from 'nextjs-toploader/app';

const AppointmentsPageContent = () => {
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const { setSelectedPatient } = usePatientVerificationStore();
  const router = useRouter();

  const openDetails = (patientId: string) => {
    router.push(ROUTES.HEALTH_ASSISTANT.PATIENT.DETAILS(patientId));
  };

  const handleView = (patient: PatientRow) => {
    if (patient.linked) {
      openDetails(patient.id);
      return;
    }
    setSelectedPatient(toVerificationPatient(patient));
    setShowVerificationDialog(true);
  };

  const {
    appointments,
    totalPatients,
    isLoading,
    search,
    limit,
    handleSearchChange,
  } = useGetAssignmentPatients();
  const { stats, isLoading: isLoadingStats } = useGetHealthAssistantStats();
  const { columns } = useAppointmentsCols({ onView: handleView });

  return (
    <div className="flex flex-col gap-3 max-w-7xl mx-auto items-start w-full px-4 sm:px-6 lg:px-10 py-10">
      {isLoadingStats ? (
        <AppointmentsStatsSkeleton />
      ) : (
        <AppointmentsStats
          medicalAssistants={stats?.totalMedicalAssistants || 0}
          totalPatients={stats?.totalPatients || 0}
        />
      )}
      <div className=" w-full  rounded-[16px] space-y-4.5 border border-(--border-stroke) p-5 ">
        <div className="bg-white  flex flex-col gap-[18px] items-start overflow-clip  w-full">
          <div className="flex flex-col  lg:flex-row justify-between gap-4 lg:gap-[200px] items-start w-full">
            <PatientSearchInput
              className="w-full lg:w-auto"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search patients by name or ID"
            />
          </div>

          <div className="flex flex-wrap font-medium items-center justify-start leading-0 px-1 py-0 text-[14px] tracking-[-0.084px] gap-x-1">
            <div className="flex flex-col justify-center relative shrink-0 text-(--text-blue)">
              <p className="leading-[20px]">Showing all patients</p>
            </div>
          </div>
        </div>

        <DataTable
          data={appointments}
          columns={columns}
          loading={isLoading}
          searchFields={[
            'patientName',
            'contact.phone',
            'contact.email',
            'accountNumber',
          ]}
          totalItems={totalPatients}
          defaultItemsPerPage={limit}
          pageSizeOptions={[7, 10, 25, 50]}
          hideHeader={true}
        />
      </div>
      <PatientVerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        portal="health-assistant"
        onLinked={() => {
          const patient =
            usePatientVerificationStore.getState().selectedPatient;
          if (patient?.id) openDetails(patient.id);
        }}
      />
    </div>
  );
};

const AppointmentsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppointmentsPageContent />
    </Suspense>
  );
};

export default AppointmentsPage;
