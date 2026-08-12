'use client';
import PatientSearch from '@/components/dashboard/health-assistant-patient-search';

const PatientDashboard = () => {
  return (
    <div className="flex flex-col gap-5 items-center pt-10 max-w-[900px] px-2 mx-auto">
      <PatientSearch />
    </div>
  );
};

export default PatientDashboard;
