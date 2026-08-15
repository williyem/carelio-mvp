'use client';

import { useState, Suspense } from 'react';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '@/components/ui/table/data-table';
import useDoctorPatientsCols from '@/components/dashboard/doctor-patients-columns';
import PatientSearchInput from '@/components/dashboard/patient-search-input';
import StatCard from '@/components/dashboard/stat-card';
import PatientVerificationDialog from '@/components/dashboard/patient-verification-dialog';
import useGetDoctorPatients from '@/hooks/page-hooks/use-get-doctor-patients';
import { PatientRow } from '@/integration/health-assistant/types';
import { ROUTES } from '@/lib/routes';
import { toVerificationPatient } from '@/lib/easy';
import { usePatientVerificationStore } from '@/stores/patient-verifcation-store';
import { useRouter } from 'nextjs-toploader/app';
import useUser from '@/hooks/useUser';
import { useSetAdminPatientActive } from '@/integration/admin/mutations';
import { getErrorMessage } from '@/integration/utils';

const DoctorPatientsPageContent = () => {
  const router = useRouter();
  const { user } = useUser();
  const isAdmin = Boolean(user?.isAdmin);
  const setPatientActive = useSetAdminPatientActive();
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const { setSelectedPatient } = usePatientVerificationStore();

  const {
    patients,
    totalPatients,
    isLoading,
    search,
    limit,
    handleSearchChange,
  } = useGetDoctorPatients();

  const openDetails = (patientId: string) => {
    router.push(ROUTES.DASHBOARD.PATIENT.DETAILS(patientId));
  };

  const handleView = (patient: PatientRow) => {
    if (patient.linked) {
      openDetails(patient.id);
      return;
    }
    setSelectedPatient(toVerificationPatient(patient));
    setShowVerificationDialog(true);
  };

  const handleToggleActive = (patient: PatientRow) => {
    const nextActive = patient.isActive === false;
    setPatientActive.mutate(
      { id: patient.id, isActive: nextActive },
      {
        onSuccess: () =>
          toast.success(nextActive ? 'Patient restored' : 'Patient revoked'),
        onError: (error) =>
          toast.error(getErrorMessage(error, 'Could not update patient')),
      }
    );
  };

  const { columns } = useDoctorPatientsCols({
    onView: handleView,
    isAdmin,
    onToggleActive: handleToggleActive,
    togglingPatientId: setPatientActive.isPending
      ? (setPatientActive.variables?.id ?? null)
      : null,
  });

  return (
    <div className="flex flex-col gap-3 max-w-7xl mx-auto items-start w-full py-2">
      <div className="flex flex-col sm:flex-row gap-[30px] items-start w-full">
        <StatCard
          label="Total Patients"
          value={totalPatients}
          icon={<Users className="w-4 h-4 text-(--text-muted)" />}
        />
      </div>

      <div className="w-full rounded-[16px] space-y-4.5 border border-(--border-stroke) p-5">
        <div className="bg-(--bg-white) flex flex-col gap-[18px] items-start overflow-clip w-full">
          <div className="flex flex-col lg:flex-row justify-between gap-4 items-start w-full">
            <PatientSearchInput
              className="w-full lg:w-auto"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search patients by name or ID"
            />
          </div>

          <div className="flex flex-wrap font-medium items-center justify-start leading-0 px-1 py-0 text-[14px] tracking-[-0.084px] gap-x-1">
            <div className="flex flex-col justify-center relative shrink-0 text-(--text-blue)">
              <p className="leading-[20px]">
                {isAdmin
                  ? 'Showing all patients (including revoked)'
                  : 'Showing all patients'}
              </p>
            </div>
          </div>
        </div>

        <DataTable
          data={patients}
          columns={columns}
          loading={isLoading}
          searchFields={[
            'patientName',
            'contact.phone',
            'contact.email',
            'identityNumber',
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
        portal="doctor"
        onLinked={() => {
          const patient =
            usePatientVerificationStore.getState().selectedPatient;
          if (patient?.id) openDetails(patient.id);
        }}
      />
    </div>
  );
};

const DoctorPatientsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DoctorPatientsPageContent />
    </Suspense>
  );
};

export default DoctorPatientsPage;
