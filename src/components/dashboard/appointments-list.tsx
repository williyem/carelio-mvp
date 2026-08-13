'use client';

import { Patient } from '@/types/patient.types';
import { cn } from '@/lib/utils';
import AppointmentItem from './appointment-item';
import {
  AppointmentItemData,
  useGetPatientAppointments,
} from '@/integration/appointments';
import { Appointment } from '@/types/appointment.types';
import {
  formatAppointmentDate,
  formatAppointmentTimeRange,
  canStartAppointment,
} from '@/lib/easy';
import AppointmentsListSkeleton from '../skeletons/appointments-list-skeleton';
import CalendarSvg from '@/assets/icons/calendar-svg';
import CancellationDetailsDialog from './cancellation-details-dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type AppointmentStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'MISSED';

const STATUS_OPTIONS: { label: string; value: AppointmentStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Upcoming', value: 'CONFIRMED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Missed', value: 'MISSED' },
];

interface AppointmentsListProps {
  appointments?: Appointment[];
  patient?: Patient;
  onStartAppointment?: (appointmentId: string) => void;
  className?: string;
  portal?: 'doctor' | 'health-assistant';
}

const AppointmentsList = ({
  patient,
  onStartAppointment,
  className,
  portal = 'doctor',
}: AppointmentsListProps) => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'ALL'>(
    'ALL'
  );

  const { appointments, isLoading, data } = useGetPatientAppointments(
    patient?.id || '',
    statusFilter === 'ALL' ? undefined : statusFilter,
    true,
    page,
    10,
    portal
  );

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isCancellationDialogOpen, setIsCancellationDialogOpen] =
    useState(false);

  const totalPages = data?.totalPages || 1;
  const hasNextPage = data?.hasNextPage;
  const hasPrevPage = data?.hasPrevPage;

  const handleStart = (appointmentId: string) => {
    if (onStartAppointment) {
      onStartAppointment(appointmentId);
    }
  };

  const emptyMessage =
    statusFilter === 'ALL'
      ? "This patient doesn't have any scheduled appointments yet."
      : `This patient doesn't have any ${statusFilter.toLowerCase()} appointments.`;

  const StatusFilter = (
    <Select
      value={statusFilter}
      onValueChange={(val) => {
        setStatusFilter(val as AppointmentStatus | 'ALL');
        setPage(1);
      }}
    >
      <SelectTrigger className="w-[160px] h-8 text-sm rounded-full">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (isLoading || !data) {
    return <AppointmentsListSkeleton className={className} />;
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className={cn('flex flex-col gap-5 items-start w-full', className)}>
        <div className="flex items-center justify-between w-full">
          <p className="font-normal leading-[1.2] text-(--text-primary) text-[14px] w-full">
            Appointments
          </p>
          <div className="flex justify-end">{StatusFilter}</div>
        </div>
        <div className="flex flex-col items-center justify-center w-full py-12 gap-4">
          <div className="bg-(--bg-light-gray) rounded-full w-16 h-16 flex items-center justify-center">
            <CalendarSvg />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="font-medium leading-[1.2] text-(--text-primary) text-[16px]">
              No appointments found
            </p>
            <p className="font-normal leading-[1.2] text-(--text-muted) text-[14px] text-center">
              {emptyMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-5 items-start w-full', className)}>
      <div className="flex items-center justify-between w-full">
        <p className="font-normal leading-[1.2] text-(--text-primary) text-[14px] w-full">
          Appointments
        </p>
        <div className="flex justify-end">{StatusFilter}</div>
      </div>
      <div className="flex flex-col gap-4 items-start w-full">
        {appointments.map((appointment) => {
          if (!appointment.startTime || !appointment.endTime) {
            return null;
          }

          const appointmentData: AppointmentItemData = {
            id: appointment.id,
            status: appointment.status,
            date: formatAppointmentDate(appointment.startTime),
            time: formatAppointmentTimeRange(
              appointment.startTime,
              appointment.endTime
            ),
            description: 'Appointment',
            doctor: appointment.doctor,
          };

          const canStart = canStartAppointment(
            appointment.startTime,
            appointment.endTime,
            appointment.status,
            patient?.isRegistrationComplete as boolean
          );

          return (
            <AppointmentItem
              key={appointment.id}
              appointment={appointmentData}
              patient={patient}
              onStartAppointment={handleStart}
              canStart={canStart}
              rawAppointment={appointment as unknown as Appointment | null}
              onViewDetails={() => {
                setSelectedAppointment(appointment as unknown as Appointment);
                setIsCancellationDialogOpen(true);
              }}
            />
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 w-full">
          <p className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={!hasNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <CancellationDetailsDialog
        isOpen={isCancellationDialogOpen}
        onOpenChange={setIsCancellationDialogOpen}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default AppointmentsList;
