'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useMemo } from 'react';
import ChevronLeftDoubleSvg from '@/assets/icons/chevron-left-double-svg';
import ChevronLeftSvg from '@/assets/icons/chevron-left-svg';
import ChevronRightSvg from '@/assets/icons/chevron-right-svg';
import ChevronRightDoubleSvg from '@/assets/icons/chevron-right-double-svg';
import ChevronDownGraySvg from '@/assets/icons/chevron-down-gray-svg';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaginationProps {
  totalItems: number;
  defaultItemsPerPage?: number;
  defaultPage?: number;
  pageSizeOptions?: number[];
  className?: string;
}

// Helper function to generate page numbers with ellipsis
const generatePageNumbers = (
  currentPage: number,
  totalPages: number
): (number | 'ellipsis')[] => {
  const pages: (number | 'ellipsis')[] = [];
  const maxVisible = 5; // Show 5 page numbers at a time

  if (totalPages <= maxVisible) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if we're near the start
    if (currentPage <= 3) {
      endPage = 5;
    }

    // Adjust if we're near the end
    if (currentPage >= totalPages - 2) {
      startPage = totalPages - 4;
    }

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('ellipsis');
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
  }

  return pages;
};

export function Pagination({
  totalItems,
  defaultItemsPerPage = 10,
  defaultPage = 1,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get page and limit from URL or use defaults
  const currentPage = Number(searchParams.get('page')) || defaultPage;
  const limit = Number(searchParams.get('limit')) || defaultItemsPerPage;

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  // Generate page numbers
  const pageNumbers = useMemo(
    () => generatePageNumbers(currentPage, totalPages),
    [currentPage, totalPages]
  );

  // Set default URL params on initial load if none exist (adds to history)
  useEffect(() => {
    if (!searchParams.has('page') || !searchParams.has('limit')) {
      const params = new URLSearchParams(searchParams);
      if (!params.has('page')) params.set('page', defaultPage.toString());
      if (!params.has('limit'))
        params.set('limit', defaultItemsPerPage.toString());
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [router, searchParams, pathname, defaultPage, defaultItemsPerPage]);

  // Update URL when page or limit changes (adds to history)
  const updateUrlParams = (newPage: number, newLimit: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    params.set('limit', newLimit.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateUrlParams(newPage, limit);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    updateUrlParams(1, newLimit); // Reset to first page when changing limit
  };

  return (
    <div
      className={cn(
        'flex gap-6 items-center relative w-full pt-4.5 border-t border-(--border-stroke)',
        className
      )}
    >
      {/* Left: Page status */}
      <div className="flex items-center px-0 py-1.5 relative shrink-0 w-[200px]">
        <p className="font-normal leading-[20px] text-[14px] text-(--text-gray-dark) text-center tracking-[-0.084px]">
          Page {currentPage} of {totalPages}
        </p>
      </div>

      {/* Center: Navigation controls */}
      <div className="flex flex-1 gap-2 items-center justify-center min-w-0 relative shrink-0">
        {/* First page button */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className={cn(
            'flex items-center justify-center overflow-clip p-1.5 rounded-[8px] shrink-0 transition-colors',
            currentPage === 1
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-100 cursor-pointer'
          )}
        >
          <ChevronLeftDoubleSvg />
        </button>

        {/* Previous page button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'flex items-center justify-center overflow-clip p-1.5 rounded-[8px] shrink-0 transition-colors',
            currentPage === 1
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-100 cursor-pointer'
          )}
        >
          <ChevronLeftSvg />
        </button>

        {/* Page numbers */}
        <div className="flex gap-2 items-center justify-center relative shrink-0">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="bg-(--bg-white) border border-(--border-stroke) flex flex-col items-start overflow-clip p-1.5 rounded-[8px] shrink-0"
                >
                  <p className="font-medium leading-[20px] text-[14px] text-(--text-gray-dark) text-center tracking-[-0.084px] w-5 whitespace-pre-wrap">
                    ...
                  </p>
                </div>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={cn(
                  'flex flex-col items-start overflow-clip p-1.5 rounded-[8px] shrink-0 transition-colors',
                  isActive
                    ? 'bg-(--bg-lighter-gray)'
                    : 'bg-(--bg-white) border border-(--border-stroke) hover:bg-gray-50'
                )}
              >
                <p
                  className={cn(
                    'font-medium leading-[20px] text-[14px] text-center tracking-[-0.084px] w-5 whitespace-pre-wrap',
                    isActive
                      ? 'text-(--text-gray-dark)'
                      : 'text-(--text-gray-dark)'
                  )}
                >
                  {page}
                </p>
              </button>
            );
          })}
        </div>

        {/* Next page button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'flex items-center justify-center overflow-clip p-1.5 rounded-[8px] shrink-0 transition-colors',
            currentPage === totalPages
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-100 cursor-pointer'
          )}
        >
          <ChevronRightSvg />
        </button>

        {/* Last page button */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={cn(
            'flex items-center justify-center overflow-clip p-1.5 rounded-[8px] shrink-0 transition-colors',
            currentPage === totalPages
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-100 cursor-pointer'
          )}
        >
          <ChevronRightDoubleSvg />
        </button>
      </div>

      {/* Right: Items per page selector */}
      <div className="flex flex-col items-end justify-center relative shrink-0 w-[200px]">
        <Select
          value={limit.toString()}
          onValueChange={(value) => handleLimitChange(Number(value))}
        >
          <SelectTrigger className="bg-(--bg-white) border border-(--border-stroke) flex gap-0.5 items-center overflow-clip pl-2.5 pr-1.5 py-1.5 rounded-[8px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] h-auto w-auto min-w-[100px] focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
            <SelectValue>
              <span className="font-normal leading-[20px] text-[14px] text-(--text-gray-dark) tracking-[-0.084px]">
                {limit} / page
              </span>
            </SelectValue>
            <div className="overflow-clip relative shrink-0 size-5 ml-1 flex items-center justify-center">
              <ChevronDownGraySvg />
            </div>
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
