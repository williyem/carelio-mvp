/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { cn } from '@/lib/utils';
import AppointmentItem from './appointment-item';
import { AppointmentItemData } from '@/integration/appointments';
import { Patient } from '@/types/patient.types';
import { Appointment } from '@/types/appointment.types';
import { canStartAppointment } from '@/lib/easy';
import AppointmentsEmptyState from '@/components/dashboard/appointments-empty-state';

export interface HealthAssistantAppointment {
  id: string;
  date: string;
  time: string;
  description: string;
  timeRemaining: string;
  doctor: any;
  status: 'COMPLETED' | 'CONFIRMED' | 'CANCELLED' | 'MISSED' | 'IN_PROGRESS';
  startTime?: string;
  endTime?: string;
  raw?: Appointment;
}

interface HealthAssistantAppointmentsProps {
  appointments: HealthAssistantAppointment[];
  className?: string;
  patient?: Patient;
  enableJoin?: boolean;
  startLabel?: string;
}

const HealthAssistantAppointments = ({
  appointments,
  className,
  patient,
  enableJoin = false,
  startLabel = 'Join call',
}: HealthAssistantAppointmentsProps) => {
  if (appointments.length === 0) {
    return (
      <div
        className={cn('flex flex-col gap-[11px] items-start w-full', className)}
      >
        <p className="font-normal leading-[1.2] text-(--text-primary) text-[16px]">
          Upcoming Appointments
        </p>
        <AppointmentsEmptyState
          title="No upcoming appointments"
          description="Scheduled visits will show up here when you have one."
        />
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col gap-[11px] items-start w-full', className)}
    >
      <p className="font-normal leading-[1.2] text-(--text-primary) text-[16px]">
        Upcoming Appointments
      </p>
      <div className="flex flex-col gap-[11px] items-start w-full">
        {appointments.map((appointment) => {
          const appointmentData: AppointmentItemData = {
            id: appointment.id,
            date: appointment.date,
            time: appointment.time,
            status: appointment.status,
            description: appointment.description,
            doctor: appointment?.doctor,
          };

          const canStart =
            enableJoin &&
            !!appointment.startTime &&
            !!appointment.endTime &&
            canStartAppointment(
              appointment.startTime,
              appointment.endTime,
              appointment.status,
              patient?.isRegistrationComplete ?? true
            );

          return (
            <AppointmentItem
              key={appointment.id}
              appointment={appointmentData}
              patient={enableJoin ? patient : undefined}
              onStartAppointment={enableJoin ? () => undefined : undefined}
              canStart={canStart}
              rawAppointment={appointment.raw ?? null}
              startLabel={startLabel}
            />
          );
        })}
      </div>
    </div>
  );
};

export default HealthAssistantAppointments;
