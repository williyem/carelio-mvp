'use client';

import { Button } from '@/components/ui/button';
import { Patient } from '@/types/patient.types';
import CalendarSvg from '@/assets/icons/calendar-svg';
import ClockSvg from '@/assets/icons/clock-svg';
import VideoRecorderSvg from '@/assets/icons/video-recorder';
import { useVideoCallStore } from '@/stores/video-call-store';
import { Appointment } from '@/integration/appointments/types';
import { AppointmentItemData } from '@/integration/appointments/types';
import StatusBadge from './status-badge';
import Link from 'next/link';
import { getFullNameFromUser } from '@/lib/easy';
import useUser from '@/hooks/useUser';

interface AppointmentItemProps {
  appointment: AppointmentItemData;
  patient?: Patient;
  onStartAppointment?: (appointmentId: string) => void;
  canStart?: boolean;
  rawAppointment?: Appointment | null;
  onViewDetails?: () => void;
}

const AppointmentItem = ({
  appointment,
  patient,
  onStartAppointment,
  canStart = false,
  rawAppointment,
  onViewDetails,
}: AppointmentItemProps) => {
  const { startCall, setSelectedAppointment } = useVideoCallStore();

  const { userId } = useUser();
  const isMyAppointment = rawAppointment?.doctor?.id === userId;

  const handleStart = () => {
    if (onStartAppointment) {
      onStartAppointment(appointment.id);
    }

    if (patient) {
      startCall(patient);
    }
    setSelectedAppointment(rawAppointment as Appointment, patient as Patient);
  };

  const showButton = onStartAppointment && canStart;
  const isCompleted = rawAppointment?.status === 'COMPLETED';
  const isCancelled = rawAppointment?.status?.toUpperCase() === 'CANCELLED';

  return (
    <div className="border border-(--border-stroke) flex flex-col items-start px-5 py-[23px] rounded-[10px] w-full">
      <div className="flex md:items-center max-md:flex-col max-md:gap-4 justify-between w-full">
        <div className="flex flex-1 gap-[10px] items-start">
          <div className="bg-(--bg-light-gray) relative rounded-full w-10 h-10 flex items-center justify-center shrink-0">
            <CalendarSvg />
          </div>
          <div className="flex items-center ">
            <div className="flex flex-col gap-[5px] items-start ">
              <p className="font-bold leading-[1.2] text-(--text-primary) sm:text-[16px] text-[14px]">
                {appointment.date}
              </p>
              <div className="flex items-start">
                <div className="flex gap-1  items-center">
                  <ClockSvg />
                  <p className="font-normal leading-[1.2] text-(--text-secondary) sm:text-[14px] text-[12px]">
                    {appointment.time}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <p className="font-normal leading-[1.2] text-(--brand-blue-text) sm:text-[14px] text-[12px]">
                  {getFullNameFromUser(appointment.doctor)}
                </p>
              </div>
            </div>
          </div>
        </div>
        {showButton ? (
          <div className="flex max-md:w-full items-center">
            <Button
              onClick={handleStart}
              variant="brand"
              disabled={!patient?.isRegistrationComplete || !isMyAppointment}
              className="bg-brand-blue border border-brand-blue h-[44px] max-md:w-full px-4 py-[10px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] gap-2"
            >
              <VideoRecorderSvg />
              <span className="font-semibold leading-[20px] sm:text-[14px] text-[12px] text-white">
                Start Now
              </span>
            </Button>
          </div>
        ) : isCancelled ? (
          <div className="flex max-md:w-full items-center">
            <Button
              variant="outline"
              onClick={onViewDetails}
              className="border-red-500 text-red-500 hover:text-red-500/90    hover:bg-red-500/10 h-[44px] max-md:w-full px-4 py-[10px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] gap-2"
            >
              <span className="font-semibold leading-[20px] sm:text-[14px] hover:text-red-500/90 text-[12px]">
                View Details
              </span>
            </Button>
          </div>
        ) : isCompleted ? (
          <div className="flex max-md:w-full items-center">
            <Link
              href={`/dashboard/patient/${patient?.id}/${appointment.id}`}
              className="max-md:w-full"
            >
              <Button
                variant="outline"
                className="border-brand-blue text-brand-blue hover:text-primary/90   hover:bg-brand-blue/10 h-[44px] max-md:w-full px-4 py-[10px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] gap-2"
              >
                <span className="font-semibold leading-[20px] sm:text-[14px] hover:text-primary/90 text-[12px]">
                  View Summary
                </span>
              </Button>
            </Link>
          </div>
        ) : (
          <StatusBadge
            status={rawAppointment?.status}
            startTime={rawAppointment?.startTime}
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentItem;
