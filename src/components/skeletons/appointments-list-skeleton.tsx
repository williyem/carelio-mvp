import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface AppointmentsListSkeletonProps {
  className?: string;
}

const AppointmentsListSkeleton = ({
  className,
}: AppointmentsListSkeletonProps) => {
  return (
    <div className={cn('flex flex-col gap-5 items-start w-full', className)}>
      <Skeleton className="h-5 w-48" />
      <div className="flex flex-col gap-4 items-start w-full">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-(--border-stroke) flex flex-col items-start px-5 py-[23px] rounded-[10px] w-full"
          >
            <div className="flex md:items-center max-md:flex-col max-md:gap-4 justify-between w-full">
              <div className="flex flex-1 gap-[10px] items-start">
                <Skeleton className="rounded-full w-10 h-10 shrink-0" />
                <div className="flex flex-col gap-[5px] items-start">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-[44px] w-[120px] rounded-[8px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentsListSkeleton;
