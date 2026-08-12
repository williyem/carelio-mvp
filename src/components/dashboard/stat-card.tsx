import React from 'react';

import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

const StatCard = ({ label, value, icon, className }: StatCardProps) => {
  return (
    <div
      className={cn(
        'border border-(--border-stroke) flex flex-col items-start px-5 py-[23px] rounded-[10px] w-full',
        className
      )}
    >
      <div className="flex flex-col gap-[3px] items-start w-full">
        <div className="flex gap-2 h-6 items-center w-full">
          {icon && (
            <div className="overflow-clip relative shrink-0 size-4">{icon}</div>
          )}
          <div className="flex flex-1 items-center min-w-0">
            <p className="font-medium leading-[20px] text-(--text-muted) text-[14px] w-full">
              {label}
            </p>
          </div>
        </div>
        <div className="flex h-6 items-center w-full">
          <div className="flex flex-1 items-center min-w-0">
            <p className="flex-1 font-medium leading-[24px] text-(--text-dark) text-[14px]">
              {value}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default StatCard;
