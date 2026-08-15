'use client';

import { useState } from 'react';
import { Calendar, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ScheduleAppointmentDialog from './schedule-appointment-dialog';
import AssignDoctorDialog from './assign-doctor-dialog';

import { Patient } from '@/types/patient.types';

interface PatientDetailsHeaderProps {
  patientId: string;
  patient?: Patient;
  onScheduleAppointment?: () => void;
  className?: string;
  portal?: 'staff' | 'patient' | 'health-assistant';
}

const PatientDetailsHeader = ({
  patientId,
  patient,
  onScheduleAppointment,
  className,
  portal = 'staff',
}: PatientDetailsHeaderProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [assignDoctorOpen, setAssignDoctorOpen] = useState(false);

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

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          {portal === 'health-assistant' && patientId ? (
            <Button
              onClick={() => setAssignDoctorOpen(true)}
              variant="outline"
              className="h-[50px] w-full min-w-0 rounded-[100px] border-brand-blue px-4 py-[10px] text-brand-blue hover:bg-brand-blue/5 hover:text-brand-blue sm:w-auto sm:min-w-[224px]"
            >
              <UserPlus className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate text-[14px] font-normal leading-[1.2]">
                Request covering doctor
              </span>
            </Button>
          ) : null}
          <Button
            onClick={handleSchedule}
            variant="brand"
            className="h-[50px] w-full rounded-[100px] border border-brand-blue bg-brand-blue px-4 py-[10px] text-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-brand-blue-dark sm:w-[250px]"
          >
            <Calendar className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate text-[14px] font-normal leading-[1.2]">
              Schedule Appointment
            </span>
          </Button>
        </div>
      </div>

      <ScheduleAppointmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        patient={patient}
        portal={portal}
      />
      {portal === 'health-assistant' ? (
        <AssignDoctorDialog
          patientId={patientId}
          patientName={patient?.name || patient?.fullName}
          open={assignDoctorOpen}
          onOpenChange={setAssignDoctorOpen}
        />
      ) : null}
    </>
  );
};

export default PatientDetailsHeader;
