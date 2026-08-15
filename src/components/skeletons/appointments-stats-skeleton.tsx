'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface AppointmentsStatsSkeletonProps {
  className?: string;
}

const AppointmentsStatsSkeleton = ({
  className,
}: AppointmentsStatsSkeletonProps) => {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row gap-[30px] items-start w-full',
        className
      )}
    >
      {Array.from({ length: 2 }).map((_, idx) => (
        <div
          key={idx}
          className="border border-(--border-stroke) flex flex-col items-start px-5 py-[23px] rounded-[10px] w-full"
        >
          <div className="flex flex-col gap-[3px] items-start w-full">
            <div className="flex gap-2 h-6 items-center w-full">
              <Skeleton className="w-4 h-4 shrink-0" />
              <Skeleton className="h-[14px] w-[150px]" />
            </div>
            <div className="flex h-6 items-center w-full">
              <Skeleton className="h-[14px] w-[60px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentsStatsSkeleton;
