import CalendarSvg from '@/assets/icons/calendar-svg';
import { cn } from '@/lib/utils';

interface AppointmentsEmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

export default function AppointmentsEmptyState({
  title,
  description,
  className,
}: AppointmentsEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center w-full py-12 gap-4',
        className
      )}
    >
      <div className="bg-(--bg-light-gray) rounded-full w-16 h-16 flex items-center justify-center">
        <CalendarSvg />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="font-medium leading-[1.2] text-(--text-primary) text-[16px]">
          {title}
        </p>
        {description ? (
          <p className="font-normal leading-[1.2] text-(--text-muted) text-[14px] text-center">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
