'use client';

import { HealthRecord } from '@/types/health-records.types';
import HealthRecordCard from './health-record-card';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import DocumentTextSvg from '@/assets/icons/document-text-svg';

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
        <EmptyState
          icon={<DocumentTextSvg />}
          title="No health records available"
          description="Visit summaries and clinical notes will appear here."
        />
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
