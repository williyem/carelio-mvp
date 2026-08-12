'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ScheduleAppointmentDialog from './schedule-appointment-dialog';

import { Patient } from '@/types/patient.types';

interface PatientDetailsHeaderProps {
  patientId: string;
  patient?: Patient;
  onScheduleAppointment?: () => void;
  className?: string;
}

const PatientDetailsHeader = ({
  patient,
  onScheduleAppointment,
  className,
}: PatientDetailsHeaderProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSchedule = () => {
    setIsDialogOpen(true);
    if (onScheduleAppointment) {
      onScheduleAppointment();
    }
  };

  return (
    <>
      <div
        className={cn(
          'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 w-full',
          className
        )}
      >
        <h1 className="font-bold leading-[1.2] text-(--text-primary) text-[20px] sm:text-[24px]">
          Patient Details
        </h1>

        <Button
          onClick={handleSchedule}
          variant="brand"
          className="bg-brand-blue border border-brand-blue h-[50px] px-4 py-[10px] rounded-[100px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] w-full sm:w-[250px] text-white hover:bg-brand-blue-dark"
        >
          <Calendar className="w-4 h-4 mr-2" />
          <span className="text-[14px] leading-[1.2] font-normal">
            Schedule Appointment
          </span>
        </Button>
      </div>

      <ScheduleAppointmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        patient={patient}
      />
    </>
  );
};

export default PatientDetailsHeader;
