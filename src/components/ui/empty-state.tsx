import * as React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  icon,
  message,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border border-gray-100 shadow-none rounded-2xl bg-white border-dashed min-h-[200px] flex flex-col items-center justify-center text-center p-6 space-y-4',
        className
      )}
    >
      {icon && <div className="text-gray-300">{icon}</div>}
      <div className="space-y-1">
        <p className="text-gray-500 font-medium">{message}</p>
        {description && (
          <p className="text-xs text-gray-400 text-center px-4 max-w-xs">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
