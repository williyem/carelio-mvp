import { Skeleton } from '@/components/ui/skeleton';

const RecentConsultationsSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 w-full">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between w-full p-4 rounded-xl border border-gray-200 bg-white"
        >
          <div className="flex items-center w-full gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentConsultationsSkeleton;
