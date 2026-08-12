/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { cn } from '@/lib/utils';
import AppointmentItem from './appointment-item';
import { AppointmentItemData } from '@/integration/appointments';

export interface HealthAssistantAppointment {
  id: string;
  date: string;
  time: string;
  description: string;
  timeRemaining: string;
  doctor: any;
  status: 'COMPLETED' | 'CONFIRMED' | 'CANCELLED' | 'MISSED';
}

interface HealthAssistantAppointmentsProps {
  appointments: HealthAssistantAppointment[];
  className?: string;
}

const HealthAssistantAppointments = ({
  appointments,
  className,
}: HealthAssistantAppointmentsProps) => {
  if (appointments.length === 0) {
    return (
      <div
        className={cn('flex flex-col gap-[11px] items-start w-full', className)}
      >
        <p className="font-normal leading-[1.2] text-(--text-primary) text-[16px]">
          Upcoming Appointments
        </p>
        <p className="text-(--text-muted) text-[14px]">
          No upcoming appointments
        </p>
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

          return (
            <AppointmentItem
              key={appointment.id}
              appointment={appointmentData}
            />
          );
        })}
      </div>
    </div>
  );
};

export default HealthAssistantAppointments;
