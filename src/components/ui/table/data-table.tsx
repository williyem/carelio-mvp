/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Suspense, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import FilterSvg from '@/assets/icons/filter-svg';
import SearchSvg from '@/assets/icons/search-svg';
import TableSkeleton from '@/components/skeletons/table-skeleton';
import { Pagination } from './pagination';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

// Utility function to safely access nested properties
const getNestedValue = (obj: any, path: string): string => {
  return (
    path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' ? current[key] : '';
    }, obj) || ''
  );
};

export interface ITableProps {
  columns: any;
  data: any;
  loading: boolean;
  searchFields?: string[];
  hideHeader?: boolean;
  totalItems?: number;
  defaultItemsPerPage?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable({
  data,
  columns,
  loading,
  hideHeader = false,
  searchFields = [],
  totalItems,
  defaultItemsPerPage = 10,
  pageSizeOptions = [10, 25, 50, 100],
  showPagination = true,
  emptyTitle = 'No data found',
  emptyDescription = 'Nothing to show here yet.',
}: ITableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get pagination from URL or use defaults
  const pageIndex = Number(searchParams.get('page')) - 1 || 0;
  const pageSize = Number(searchParams.get('limit')) || defaultItemsPerPage;

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState<string>('');

  const globalFilterFn = useCallback(
    (row: Row<any>, columnId: string, filterValue: string) => {
      const searchTerm = filterValue.toLowerCase();
      if (!searchFields.length) return true;
      return searchFields.some((field) => {
        const value =
          getNestedValue(row.original, field)?.toString().toLowerCase() || '';
        return value.includes(searchTerm);
      });
    },
    [searchFields]
  );

  // Handle pagination changes - update URL
  const handlePaginationChange = useCallback(
    (updater: any) => {
      const newPagination =
        typeof updater === 'function'
          ? updater({ pageIndex, pageSize })
          : updater;

      const newPageIndex = newPagination.pageIndex ?? pageIndex;
      const newPageSize = newPagination.pageSize ?? pageSize;

      const params = new URLSearchParams(searchParams);
      params.set('page', (newPageIndex + 1).toString());
      params.set('limit', newPageSize.toString());
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pageIndex, pageSize, searchParams, pathname, router]
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Enable pagination
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: handlePaginationChange,
    globalFilterFn,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: defaultItemsPerPage,
      },
    },
    manualPagination: totalItems !== undefined,
    rowCount: totalItems,
  });

  // const tempHeaders =
  //   table
  //     .getHeaderGroups()
  //     .map(x => x.headers)
  //     .flat() || [];

  // const tempRows = table.getCoreRowModel().rows || [];

  return (
    <div className="w-full">
      {hideHeader ? null : (
        <div className="flex justify-end gap-x-3 items-center py-4">
          <div className="relative max-sm:w-full md:block">
            <div className="absolute z-10 inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
              <SearchSvg />
            </div>
            <Input
              placeholder="Search..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="w-full sm:w-[400px] placeholder:text-sm border-(--border-input) ps-7 py-2.5 h-[44px] bg-(--bg-input) ring-offset-background focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="text-sm py-2.5 px-4 rounded-[8px] border-[var(--outline-border)]"
              >
                <FilterSvg /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <div className="overflow-hidden space-y-8 ">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-(--bg-lighter-gray) border-0! h-[36px]!"
              >
                {headerGroup.headers.map((header, index) => {
                  const isFirst = index === 0;
                  const isLast = index === headerGroup.headers.length - 1;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'last:border-r-0 px-4 py-2 text-left max-md:text-xs text-sm font-normal text-(--text-gray-dark)',
                        isFirst && 'rounded-l-[10px]',
                        isLast && 'rounded-r-[10px]'
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <tr>
                <td colSpan={columns.length}>
                  <TableSkeleton columnsCount={columns.length} />
                </td>
              </tr>
            ) : table.getRowModel()?.rows?.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="border-0">
                  <EmptyState
                    icon={<SearchSvg />}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </td>
              </tr>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="bg-(--bg-white) text-xs h-[56px] px-4 font-medium border-b border-(--border-stroke)"
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="border-0 px-4 h-[56px] max-md:text-xs text-sm text-(--text-primary)"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="border-0">
                  <EmptyState
                    icon={<SearchSvg />}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {showPagination && totalItems !== undefined ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-end py-4 px-4 w-full">
                Loading...
              </div>
            }
          >
            <Pagination
              totalItems={totalItems}
              defaultItemsPerPage={defaultItemsPerPage}
              pageSizeOptions={pageSizeOptions}
            />
          </Suspense>
        ) : (
          <div className="flex items-center justify-end gap-x-[23px] py-4 px-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-(--text-gray-darker)">
                Rows Per page
              </span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="rounded-md border border-(--border-stroke) bg-(--bg-white) py-1 px-2 text-xs text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {[10, 25, 50, 100].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="w-[30px] h-[30px] disabled:bg-(--bg-disabled) bg-(--bg-button-primary) hover:bg-(--bg-button-primary)/90 hover:text-white disabled:text-(--text-muted) text-white rounded-full disabled:border-(--border-gray) disabled:opacity-50"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Button>
              <span className="text-xs text-(--text-secondary)">
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
                -
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{' '}
                of {table.getFilteredRowModel().rows.length}
              </span>
              <Button
                variant="outline"
                className="w-[30px] h-[30px] disabled:bg-(--bg-disabled) bg-(--bg-button-primary) hover:bg-(--bg-button-primary)/90 hover:text-white disabled:text-(--text-muted) text-white rounded-full disabled:border-(--border-gray) disabled:opacity-50"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
