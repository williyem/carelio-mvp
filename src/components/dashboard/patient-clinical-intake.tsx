'use client';

import { cn } from '@/lib/utils';
import {
  formatClinicalList,
  formatEmergencyContact,
  type PatientEmergencyContact,
} from '@/lib/patient-clinical';

interface PatientClinicalIntakeProps {
  allergies?: string[] | string | null;
  conditions?: string[] | string | null;
  emergencyContact?: PatientEmergencyContact | null;
  className?: string;
  itemClassName?: string;
}

export default function PatientClinicalIntake({
  allergies,
  conditions,
  emergencyContact,
  className,
  itemClassName,
}: PatientClinicalIntakeProps) {
  const rows = [
    { label: 'Allergies', value: formatClinicalList(allergies) },
    {
      label: 'Medical conditions',
      value: formatClinicalList(conditions),
    },
    {
      label: 'Emergency contact',
      value: formatEmergencyContact(emergencyContact),
    },
  ];

  return (
    <div className={cn('flex flex-col gap-3 w-full', className)}>
      {rows.map((row) => (
        <div
          key={row.label}
          className={cn(
            'bg-(--bg-warning) flex items-center px-4 sm:px-5 py-3 sm:py-[15px] rounded-[10px] w-full',
            itemClassName
          )}
        >
          <div className="flex flex-col items-start space-y-1 w-full">
            <p className="font-normal leading-[1.2] text-(--text-primary) text-sm sm:text-[16px]">
              {row.label}
            </p>
            <p className="font-normal leading-[1.2] text-(--text-secondary) text-xs sm:text-[14px] wrap-break-word">
              {row.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
