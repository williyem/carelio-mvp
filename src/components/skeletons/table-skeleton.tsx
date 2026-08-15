'use client';

import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

interface TableSkeletonProps {
  columnsCount: number;
  rowsCount?: number;
}

const TableSkeleton = ({ columnsCount, rowsCount = 4 }: TableSkeletonProps) => {
  return (
    <div className="overflow-hidden w-full">
      {Array.from({ length: rowsCount }).map((_, idx) => (
        <div
          key={idx}
          className="bg-(--bg-white) text-xs  font-medium border-b border-(--border-stroke) flex items-center"
        >
          {Array.from({ length: columnsCount }).map((_, cellIdx) => (
            <div
              key={cellIdx}
              className="flex-1 border-0 px-4 py-[18px] max-md:text-xs text-sm text-(--text-primary)"
            >
              <Skeleton className="h-4 w-[90%]" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
