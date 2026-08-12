import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface HIERecordsListSkeletonProps {
  className?: string;
}

const HIERecordsListSkeleton = ({ className }: HIERecordsListSkeletonProps) => {
  return (
    <div className={cn('flex flex-col gap-5 items-start w-full', className)}>
      {[1, 2].map((i) => (
        <div
          key={i}
          className="border border-(--border-stroke) flex flex-col gap-5 items-start px-5 py-[15px] rounded-[10px] w-full"
        >
          {/* Hospital Header */}
          <div className="flex items-start relative w-full">
            <div className="flex flex-1 flex-col gap-[6px] items-start justify-center">
              <Skeleton className="h-5 w-48" />
              <div className="flex flex-col gap-[5px] items-start">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>

          {/* Provider */}
          <div className="flex flex-col gap-2 items-start w-full">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-40" />
          </div>

          {/* Diagnosis */}
          <div className="flex flex-col gap-2 items-start w-full">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-36" />
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-2 items-start w-full">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default HIERecordsListSkeleton;
