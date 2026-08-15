'use client';

import { createColumnHelper } from '@tanstack/react-table';
import SortableColumnHeader from '@/components/ui/table/table-column';
import { Button } from '@/components/ui/button';
import { PatientRow } from '@/integration/health-assistant/types';
import { cn } from '@/lib/utils';

interface UseAppointmentsColsProps {
  onView?: (patient: PatientRow) => void;
}

const useAppointmentsCols = ({ onView }: UseAppointmentsColsProps = {}) => {
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
                : 'bg-state-error-lighter text-state-error-base'
            }`}
          >
            {isComplete ? 'Complete' : 'Incomplete'}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span>Actions</span>,
      cell: (info) => {
        const patient = info.row.original as PatientRow;
        return (
          <div className="flex items-center gap-x-2">
            <Button
              variant="outline"
              onClick={() => onView?.(patient)}
              className={cn(
                'h-[38px] px-[15px] border-(--border-gray) bg-(--bg-light-gray) flex-1 w-full max-w-[76px] rounded-[8px]'
              )}
            >
              <span className="font-normal text-[14px] leading-[1.2]">
                {patient.linked ? 'View' : 'Verify'}
              </span>
            </Button>
          </div>
        );
      },
    }),
  ];

  return {
    columns,
  };
};

export default useAppointmentsCols;
