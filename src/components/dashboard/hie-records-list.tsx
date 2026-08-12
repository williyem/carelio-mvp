'use client';

import { HIERecord } from '@/types/patient.types';
import { cn } from '@/lib/utils';
import CalendarSvg from '@/assets/icons/calendar-svg';
import HospitalSvg from '@/assets/icons/hospital-svg';
import HIERecordsListSkeleton from './hie-records-list-skeleton';

interface HIERecordsListProps {
  records: HIERecord[];
  isLoading?: boolean;
  className?: string;
}

const HIERecordsList = ({
  records,
  isLoading = false,
  className,
}: HIERecordsListProps) => {
  if (isLoading) {
    return <HIERecordsListSkeleton className={className} />;
  }

  if (records.length === 0) {
    return (
      <div className={cn('flex flex-col gap-5 items-start w-full', className)}>
        <div className="flex flex-col items-center justify-center w-full py-12 gap-4">
          <div className="bg-(--bg-light-gray) rounded-full w-16 h-16 flex items-center justify-center">
            <HospitalSvg />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="font-medium leading-[1.2] text-(--text-primary) text-[16px]">
              No HIE records available
            </p>
            <p className="font-normal leading-[1.2] text-(--text-muted) text-[14px] text-center">
              This patient doesn&apos;t have any Health Information Exchange
              records yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-5 items-start w-full', className)}>
      {records.map((record) => (
        <div
          key={record.id}
          className="border border-(--border-stroke) flex flex-col gap-5 items-start px-5 py-[15px] rounded-[10px] w-full"
        >
          {/* Hospital Header */}
          <div className="flex items-start relative w-full">
            <div className="flex flex-1 flex-col gap-[6px] items-start justify-center">
              <h3 className="font-bold leading-[1.2] text-(--text-primary) text-base sm:text-[18px]">
                {record.hospitalName}
              </h3>
              <div className="flex flex-col gap-[5px] items-start">
                {/* Date */}
                <div className="flex gap-[5px] items-center">
                  <div className="w-4 h-4">
                    <CalendarSvg />
                  </div>
                  <p className="font-normal leading-[1.2] text-(--text-secondary) text-xs sm:text-[14px]">
                    {record.date}
                  </p>
                </div>
                {/* Department */}
                <div className="flex gap-[5px] items-center">
                  <div className="w-4 h-4">
                    <HospitalSvg />
                  </div>
                  <p className="font-normal leading-[1.2] text-(--text-secondary) text-xs sm:text-[14px]">
                    {record.department}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Provider */}
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="font-bold leading-[1.2] text-(--text-primary) text-sm sm:text-[14px]">
              Provider
            </p>
            <p className="font-normal leading-[1.2] text-(--text-secondary) text-sm sm:text-[16px]">
              {record.provider}
            </p>
          </div>

          {/* Diagnosis */}
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="font-bold leading-[1.2] text-(--text-primary) text-sm sm:text-[14px]">
              Diagnosis
            </p>
            <p className="font-normal leading-[1.2] text-(--brand-blue-text) text-sm sm:text-[16px]">
              {record.diagnosis}
            </p>
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="font-bold leading-[1.2] text-(--text-primary) text-sm sm:text-[14px]">
              Summary
            </p>
            <p className="font-normal leading-[1.2] text-(--text-secondary) text-sm sm:text-[16px] w-full wrap-break-word">
              {record.summary}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HIERecordsList;
