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

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {portal === 'health-assistant' && patientId ? (
            <Button
              onClick={() => setAssignDoctorOpen(true)}
              variant="outline"
              className="h-[50px] px-4 py-[10px] rounded-[100px] w-full sm:w-[200px] border-brand-blue text-brand-blue"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              <span className="text-[14px] leading-[1.2] font-normal">
                Request covering doctor
              </span>
            </Button>
          ) : null}
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
