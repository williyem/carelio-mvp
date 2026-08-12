'use client';

import { HealthRecord } from '@/types/health-records.types';
import HealthRecordCard from './health-record-card';
import { cn } from '@/lib/utils';

interface HealthRecordsListProps {
  records: HealthRecord[];
  onRecordClick?: (recordId: string) => void;
  className?: string;
}

const HealthRecordsList = ({
  records,
  onRecordClick,
  className,
}: HealthRecordsListProps) => {
  if (records.length === 0) {
    return (
      <div className={cn('flex flex-col gap-5 items-start w-full', className)}>
        <p className="text-[var(--text-muted)] text-[14px]">
          No health records available
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4 items-start w-full', className)}>
      {records.map((record) => (
        <HealthRecordCard
          key={record.id}
          record={record}
          onClick={onRecordClick}
        />
      ))}
    </div>
  );
};

export default HealthRecordsList;
