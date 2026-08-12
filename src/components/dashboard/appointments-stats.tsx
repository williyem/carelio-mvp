'use client';

import { Users } from 'lucide-react';
import StatCard from './stat-card';

interface AppointmentsStatsProps {
  medicalAssistants: number;
  totalPatients: number;
  unassignedPatients: number;
}

const AppointmentsStats = ({
  medicalAssistants,
  totalPatients,
  unassignedPatients,
}: AppointmentsStatsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-[30px] items-start w-full">
      <StatCard
        label="Medical Assistants"
        value={medicalAssistants}
        icon={<Users className="w-4 h-4 text-(--text-muted)" />}
        className=""
      />
      <StatCard
        label="Total Patients"
        value={totalPatients}
        icon={<Users className="w-4 h-4 text-(--text-muted)" />}
        className=""
      />
      <StatCard
        label="Unassigned Patients"
        value={unassignedPatients}
        icon={<Users className="w-4 h-4 text-(--text-muted)" />}
        className=""
      />
    </div>
  );
};

export default AppointmentsStats;
