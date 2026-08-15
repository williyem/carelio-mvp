import * as React from 'react';
import { cn } from '@/lib/utils';
import CalendarSvg from '@/assets/icons/calendar-svg';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  /** @deprecated Use `title` instead */
  message?: string;
}

export function EmptyState({
  title,
  message,
  description,
  icon,
  className,
}: EmptyStateProps) {
  const heading = title || message || '';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center w-full py-12 gap-4',
        className
      )}
    >
      <div className="bg-(--bg-light-gray) rounded-full w-16 h-16 flex items-center justify-center shrink-0">
        {icon ?? <CalendarSvg />}
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="font-medium leading-[1.2] text-(--text-primary) text-[16px] text-center">
          {heading}
        </p>
        {description ? (
          <p className="font-normal leading-[1.2] text-(--text-muted) text-[14px] text-center max-w-sm">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default EmptyState;
