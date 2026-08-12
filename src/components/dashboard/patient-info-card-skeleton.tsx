import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PatientInfoCardSkeletonProps {
  className?: string;
}

const PatientInfoCardSkeleton = ({
  className,
}: PatientInfoCardSkeletonProps) => {
  return (
    <div
      className={cn(
        'border border-(--border-stroke) flex flex-col gap-4 sm:gap-5 items-start px-4 sm:px-5 py-4 sm:py-[23px] rounded-[10px] w-full',
        className
      )}
    >
      {/* Patient Name and ID */}
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-1 gap-2 sm:gap-[10px] items-start">
          <Skeleton className="rounded-full w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
          <div className="flex flex-1 flex-col gap-1 sm:gap-[6px] items-start min-w-0">
            <Skeleton className="h-4 sm:h-5 w-32" />
            <Skeleton className="h-3 sm:h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Personal Details Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-start gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>

      {/* Contact Details Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-start gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientInfoCardSkeleton;
