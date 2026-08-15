import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { AppointmentNote } from '@/integration/appointments/types';
import { ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import UserSvg from '@/assets/icons/user-svg';
import { useVideoCallStore } from '@/stores/video-call-store';
import CalendarSvg from '@/assets/icons/calendar-svg';
import ClockSvg from '@/assets/icons/clock-svg';
import DocumentTextSvg from '@/assets/icons/document-text-svg';

interface HealthRecordRowProps {
  note: AppointmentNote;
  selectedNote: AppointmentNote | null;
  onSelect: (note: AppointmentNote) => void;
  viewOnly?: boolean;
  patient?: { fullName: string };
}

const HealthRecordRow = ({
  note,
  selectedNote,
  viewOnly = false,
  onSelect,
  patient: patientProp,
}: HealthRecordRowProps) => {
  const { selectedAppointment } = useVideoCallStore();
  const patient = patientProp || selectedAppointment?.patient;

  const rawDateStr = note?.appointment?.startTime || note?.createdAt;
  const appointmentDate = rawDateStr ? new Date(rawDateStr) : null;
  const isValidDate = appointmentDate && !isNaN(appointmentDate.getTime());

  const formattedDate = isValidDate
    ? format(appointmentDate as Date, 'MMM d, yyyy')
    : 'N/A';

  // Calculate duration in minutes
  let duration = '';
  if (
    note?.appointment?.startTime &&
    note?.appointment?.endTime &&
    isValidDate
  ) {
    const end = new Date(note.appointment.endTime);
    if (!isNaN(end.getTime())) {
      const durationMinutes = Math.round(
        (end.getTime() - (appointmentDate as Date).getTime()) / (1000 * 60)
      );
      if (durationMinutes >= 0) {
        duration = `${durationMinutes} mins`;
      }
    }
  }

  return (
    <div
      key={note?.id}
      onClick={() => onSelect(note)}
      className={cn(
        'flex  items-center justify-between w-full p-4 rounded-xl border cursor-pointer transition-all',
        selectedNote?.id === note?.id && !viewOnly
          ? 'border-brand-blue bg-blue-50/50'
          : 'border-(--border-stroke) hover:border-(--border-gray) bg-(--bg-white)'
      )}
    >
      <div className={cn('flex items-center w-full gap-4 ')}>
        <Avatar className="h-10 w-10 bg-(--bg-light-gray)">
          <AvatarFallback className="text-(--text-muted)">
            <UserSvg />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-(--text-primary)">
            {patient?.fullName}
          </h3>
          <div className="text-sm flex items-center gap-2 text-(--text-secondary) font-normal">
            <div className="flex items-center gap-1">
              <CalendarSvg />
              <p>{formattedDate}</p>
            </div>

            {duration && (
              <div className="flex items-center gap-1 text-(--text-secondary)">
                <ClockSvg />
                <p>{duration}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {!viewOnly ? (
        <ChevronRight className="h-5 w-5 text-(--text-muted) group-hover:text-(--text-secondary) group-hover:translate-x-0.5 transition-all" />
      ) : (
        <DocumentTextSvg />
      )}
    </div>
  );
};

export default HealthRecordRow;
