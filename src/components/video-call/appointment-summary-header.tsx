'use client';

import { Calendar, Clock, Stethoscope, User } from 'lucide-react';
import StatusBadge from '@/components/dashboard/status-badge';
import {
  formatAppointmentDate,
  formatAppointmentTimeRange,
  getFullNameFromUser,
} from '@/lib/easy';

interface AppointmentSummaryHeaderProps {
  appointment?: {
    code?: string;
    status?: string;
    startTime?: string;
    endTime?: string;
    doctor?: { firstName: string; lastName: string };
    patient?: { fullName?: string };
  } | null;
  patientName?: string;
}

const AppointmentSummaryHeader = ({
  appointment,
  patientName,
}: AppointmentSummaryHeaderProps) => {
  const name = patientName || appointment?.patient?.fullName || 'Patient';
  const date =
    formatAppointmentDate(appointment?.startTime) || 'Date unavailable';
  const time =
    formatAppointmentTimeRange(appointment?.startTime, appointment?.endTime) ||
    'Time unavailable';
  const doctorName = appointment?.doctor
    ? getFullNameFromUser(appointment.doctor)
    : 'Doctor';

  return (
    <div className="border border-(--border-stroke) rounded-[10px] bg-(--bg-white) px-5 py-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-(--bg-light-gray) rounded-full w-10 h-10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-(--text-primary)" />
            </div>
            <div>
              <p className="font-bold text-(--text-primary) text-[16px]">
                {name}
              </p>
              {appointment?.code && (
                <p className="text-sm text-(--text-secondary)">
                  Appointment {appointment.code}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-(--text-secondary)">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {time}
            </span>
            <span className="flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4" />
              {doctorName}
            </span>
          </div>
        </div>
        <StatusBadge
          status={appointment?.status}
          startTime={appointment?.startTime}
          endTime={appointment?.endTime}
        />
      </div>
    </div>
  );
};

export default AppointmentSummaryHeader;
