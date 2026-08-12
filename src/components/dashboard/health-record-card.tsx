'use client';

import { Calendar, ChevronRight, User } from 'lucide-react';
import { HealthRecord } from '@/types/health-records.types';
import { cn } from '@/lib/utils';

interface HealthRecordCardProps {
  record: HealthRecord;
  onClick?: (recordId: string) => void;
  className?: string;
}

const HealthRecordCard = ({
  record,
  onClick,
  className,
}: HealthRecordCardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(record.id);
    }
  };

  return (
    <div
      className={cn(
        'border border-[var(--border-stroke)] flex flex-col items-start px-4 sm:px-5 py-4 sm:py-[23px] rounded-[10px] w-full cursor-pointer hover:bg-gray-50 transition-colors',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between w-full gap-2">
        <div className="flex flex-1 gap-2 sm:gap-[10px] items-center min-w-0">
          <div className="bg-(--bg-light-gray) relative rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--text-primary)]" />
          </div>
          <div className="flex items-center min-w-0 flex-1">
            <div className="flex flex-col gap-[2px] items-start min-w-0 flex-1">
              <p className="font-bold leading-[1.2] text-[var(--text-primary)] text-[14px] sm:text-[16px] truncate w-full">
                {record.patientName}
              </p>
              <div className="flex items-start">
                <div className="flex gap-[5px] items-center">
                  <Calendar className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[var(--text-secondary)] shrink-0" />
                  <p className="font-normal leading-[1.2] text-[var(--text-secondary)] text-[12px] sm:text-[14px]">
                    {record.date}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center shrink-0">
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--text-secondary)]" />
        </div>
      </div>
    </div>
  );
};

export default HealthRecordCard;
