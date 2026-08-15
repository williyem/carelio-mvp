'use client';

import { Calendar, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HealthAssistantActionsProps {
  onScheduleAppointment?: () => void;
  onRecordVitals?: () => void;
  onViewRecords?: () => void;
  className?: string;
}

const HealthAssistantActions = ({
  onScheduleAppointment,
  onRecordVitals,
  onViewRecords,
  className,
}: HealthAssistantActionsProps) => {
  return (
    <div
      className={cn(
        'flex gap-[30px] max-md:flex-col max-md:gap-4 items-start w-full',
        className
      )}
    >
      <Button
        onClick={onScheduleAppointment}
        variant="brand"
        size={undefined}
        className="flex-1 bg-(--brand-blue) cursor-pointer  max-md:w-full border border-(--brand-blue) min-h-[50px] h-[50px] px-4 py-[10px] rounded-[100px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] gap-2"
      >
        <Calendar className="w-4 h-4" />
        <span className="text-[16px] max-md:text-sm font-bold leading-[1.2] text-white">
          Schedule Appointment
        </span>
      </Button>

      <Button
        onClick={onRecordVitals}
        size={undefined}
        className="flex-1 bg-(--bg-button-primary) cursor-pointer max-md:w-full border border-(--bg-button-primary) min-h-[50px] h-[50px] px-4 py-[10px] rounded-[100px] gap-2 hover:bg-(--bg-button-primary)/90 text-white"
      >
        <User className="w-6 h-6" />
        <span className="text-[16px] max-md:text-sm font-bold leading-[1.2] text-white">
          My information
        </span>
      </Button>

      <Button
        onClick={onViewRecords}
        variant="outline"
        size={undefined}
        className="flex-1 border cursor-pointer  border-(--brand-blue) max-md:w-full min-h-[50px] h-[50px] px-4 py-[10px] rounded-[100px] gap-2 bg-(--bg-white) hover:bg-(--bg-white)"
      >
        <FileText className="w-4 h-4 text-(--brand-blue)" />
        <span className="text-[16px] max-md:text-sm font-normal leading-[1.2] text-(--text-blue)">
          My Health Records
        </span>
      </Button>
    </div>
  );
};

export default HealthAssistantActions;
