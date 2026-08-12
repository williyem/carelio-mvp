'use client';

import { useState, Suspense } from 'react';
import DataTable from '@/components/ui/table/data-table';
import useAppointmentsCols from '@/components/dashboard/appointments-columns';
import AppointmentsStats from '@/components/dashboard/appointments-stats';
import AppointmentsStatsSkeleton from '@/components/skeletons/appointments-stats-skeleton';
import MedicalAssistantSelector from '@/components/dashboard/medical-assistant-selector';
import { Clinician } from '@/types/clinician.types';
import PatientSearchInput from '@/components/dashboard/patient-search-input';
import ReassignMedicalAssistantDialog from '@/components/dashboard/reassign-medical-assistant-dialog';
import useGetAssignmentPatients from '@/hooks/page-hooks/assignments/useGetAssignmentPatients';
import useGetHealthAssistantStats from '@/integration/health-assistant/queries/useGetHealthAssistantStats';
import { PatientRow } from '@/integration/health-assistant/types';
import { useRouter } from 'nextjs-toploader/app';
const AppointmentsPageContent = () => {
  const [selectedAssistant, setSelectedAssistant] = useState<Clinician | null>(
    null
  );
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientRow | null>(
    null
  );
  const [showUnassigned, setShowUnassigned] = useState(false);
  const router = useRouter();

  const handleReassign = (patient: PatientRow) => {
    setSelectedPatient(patient);
    setReassignDialogOpen(true);
  };

  const handleView = (patient: PatientRow) => {
    router.push(`/health-assistant/patient/${patient.id}`);
  };

  const {
    appointments,
    totalPatients,
    isLoading,
    search,
    limit,
    handleSearchChange,
  } = useGetAssignmentPatients({
    assistantId: selectedAssistant?.id,
    showUnassigned: showUnassigned,
  });
  const { stats, isLoading: isLoadingStats } = useGetHealthAssistantStats();
  const { columns } = useAppointmentsCols({
    onReassign: handleReassign,
    onView: handleView,
  });

  console.log('Patients', appointments);

  return (
    <div className="flex flex-col gap-3 max-w-7xl mx-auto items-start w-full px-4 sm:px-6 lg:px-10 py-10">
      {isLoadingStats ? (
        <AppointmentsStatsSkeleton />
      ) : (
        <AppointmentsStats
          medicalAssistants={stats?.totalMedicalAssistants || 0}
          totalPatients={stats?.totalPatients || 0}
          unassignedPatients={stats?.unassignedPatients || 0}
        />
      )}
      <div className=" w-full  rounded-[16px] space-y-4.5 border border-(--border-stroke) p-5 ">
        {/* Search and Filter Section */}
        <div className="bg-white  flex flex-col gap-[18px] items-start overflow-clip  w-full">
          {/* Search and Medical Assistant Selector */}
          <div className="flex flex-col  lg:flex-row justify-between gap-4 lg:gap-[200px] items-start w-full">
            <PatientSearchInput
              className="w-full lg:w-auto"
              value={search}
              onChange={handleSearchChange}
            />
            <div className="w-full lg:w-auto flex flex-col-reverse  lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showUnassigned"
                  checked={showUnassigned}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setShowUnassigned(checked);
                    if (checked) setSelectedAssistant(null);
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-(--text-primary) focus:ring-(--text-primary)"
                />
                <label
                  htmlFor="showUnassigned"
                  className="text-sm font-medium text-(--text-blue)"
                >
                  Show Unassigned
                </label>
              </div>
              <MedicalAssistantSelector
                selectedAssistant={selectedAssistant}
                onSelect={(assistant) => {
                  setSelectedAssistant(assistant);
                  if (assistant) setShowUnassigned(false);
                }}
              />
            </div>
          </div>

          {/* Showing patients assigned to units */}
          <div className="flex flex-wrap font-medium items-center justify-start leading-0 px-1 py-0 text-[14px] tracking-[-0.084px] gap-x-1">
            <div className="flex flex-col justify-center relative shrink-0 text-(--text-blue)">
              <p className="leading-[20px]">
                {showUnassigned
                  ? 'Showing unassigned patients'
                  : selectedAssistant
                    ? 'Showing patients assigned to:'
                    : 'Showing all patients'}
              </p>
            </div>
            {!showUnassigned && selectedAssistant && (
              <div className="flex flex-col justify-center relative shrink-0 text-(--text-primary)">
                <p className="leading-[20px] wrap-break-word">
                  {selectedAssistant.name}
                </p>
              </div>
            )}
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
      <ReassignMedicalAssistantDialog
        patient={selectedPatient}
        open={reassignDialogOpen}
        onOpenChange={setReassignDialogOpen}
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
