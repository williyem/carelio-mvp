'use client';

import { Suspense } from 'react';
import { Users } from 'lucide-react';
import DataTable from '@/components/ui/table/data-table';
import useDoctorPatientsCols from '@/components/dashboard/doctor-patients-columns';
import PatientSearchInput from '@/components/dashboard/patient-search-input';
import StatCard from '@/components/dashboard/stat-card';
import useGetDoctorPatients from '@/hooks/page-hooks/use-get-doctor-patients';
import { PatientRow } from '@/integration/health-assistant/types';
import { ROUTES } from '@/lib/routes';
import { useRouter } from 'nextjs-toploader/app';

const DoctorPatientsPageContent = () => {
  const router = useRouter();

  const {
    patients,
    totalPatients,
    isLoading,
    search,
    limit,
    handleSearchChange,
  } = useGetDoctorPatients();

  const handleView = (patient: PatientRow) => {
    router.push(ROUTES.DASHBOARD.PATIENT.DETAILS(patient.id));
  };

  const { columns } = useDoctorPatientsCols({ onView: handleView });

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
        <div className="bg-white flex flex-col gap-[18px] items-start overflow-clip w-full">
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
                Showing patients you have attended to
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
