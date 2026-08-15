'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import SortableColumnHeader from '@/components/ui/table/table-column';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PatientRow } from '@/integration/health-assistant/types';
import { cn } from '@/lib/utils';

interface UseDoctorPatientsColsProps {
  onView?: (patient: PatientRow) => void;
  isAdmin?: boolean;
  onToggleActive?: (patient: PatientRow) => void;
  togglingPatientId?: string | null;
}

const useDoctorPatientsCols = ({
  onView,
  isAdmin = false,
  onToggleActive,
  togglingPatientId = null,
}: UseDoctorPatientsColsProps = {}) => {
  const columnHelper = createColumnHelper<PatientRow>();

  const columns = [
    columnHelper.accessor('patientName', {
      header: ({ column }) => (
        <SortableColumnHeader column={column} label="Patient Name" />
      ),
      cell: (info) => {
        const patient = info.row.original;
        const name = info.getValue();
        const fallback = patient.contact?.email || patient.contact?.phone;
        return (
          <span className="font-medium">
            {name && name.trim() !== '' ? name : fallback || 'N/A'}
          </span>
        );
      },
    }),
    columnHelper.accessor('identityNumber', {
      header: ({ column }) => (
        <SortableColumnHeader column={column} label="Identity Number" />
      ),
      cell: (info) => <span className="font-normal">{info.getValue()}</span>,
    }),
    columnHelper.accessor('age', {
      header: ({ column }) => (
        <SortableColumnHeader column={column} label="Age" />
      ),
      cell: (info) => {
        const age = info.getValue();
        return (
          <span className="font-normal">
            {age === null || Number.isNaN(age) ? '—' : age}
          </span>
        );
      },
    }),
    columnHelper.accessor('isRegistrationComplete', {
      header: ({ column }) => (
        <SortableColumnHeader column={column} label="Registration Status" />
      ),
      cell: (info) => {
        const isComplete = info.getValue();
        return (
          <span
            className={`px-3 py-1 rounded-full text-[12px] font-medium ${
              isComplete
                ? 'bg-(--bg-success-light) text-(--text-green-dark)'
                : 'bg-red-50 text-[#E42826]'
            }`}
          >
            {isComplete ? 'Complete' : 'Incomplete'}
          </span>
        );
      },
    }),
    ...(isAdmin
      ? [
          columnHelper.accessor('isActive', {
            header: ({ column }) => (
              <SortableColumnHeader column={column} label="Account" />
            ),
            cell: (info) => {
              const isActive = info.getValue() !== false;
              return (
                <span
                  className={`px-3 py-1 rounded-full text-[12px] font-medium ${
                    isActive
                      ? 'bg-(--bg-success-light) text-(--text-green-dark)'
                      : 'bg-red-50 text-[#E42826] '
                  }`}
                >
                  {isActive ? 'Active' : 'Revoked'}
                </span>
              );
            },
          }),
        ]
      : []),
    columnHelper.display({
      id: 'actions',
      header: () => <span>Actions</span>,
      cell: (info) => {
        const patient = info.row.original as PatientRow;
        const isActive = patient.isActive !== false;
        const isToggling = togglingPatientId === patient.id;
        const isLinked = Boolean(patient.linked);

        if (isAdmin) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-[38px] w-[38px] rounded-[8px] border-[#D4D5D6] bg-white"
                  aria-label="Patient actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem
                  onClick={() => onView?.(patient)}
                  className={cn(
                    'cursor-pointer',
                    isLinked ? 'text-brand-blue focus:text-brand-blue' : ''
                  )}
                >
                  {isLinked ? 'View Details' : 'Verify access'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isToggling}
                  onClick={() => onToggleActive?.(patient)}
                  className={cn(
                    'cursor-pointer',
                    isActive
                      ? 'text-red-600 focus:text-red-700'
                      : 'text-(--text-green-dark) focus:text-(--text-green-dark)'
                  )}
                >
                  {isToggling
                    ? 'Saving...'
                    : isActive
                      ? 'Revoke account'
                      : 'Restore account'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        return (
          <Button
            variant="outline"
            onClick={() => onView?.(patient)}
            className={cn(
              'h-[38px] px-[15px] flex-1 w-full max-w-[120px] rounded-[8px] font-normal text-[14px] leading-[1.2]',
              isLinked
                ? 'border-brand-blue text-brand-blue bg-white hover:bg-brand-blue/5'
                : 'border-[#D4D5D6] bg-[#F6F6F6] text-(--text-primary)'
            )}
          >
            {isLinked ? 'View Details' : 'Verify access'}
          </Button>
        );
      },
    }),
  ];

  return { columns };
};

export default useDoctorPatientsCols;
