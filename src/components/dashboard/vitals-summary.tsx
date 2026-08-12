'use client';

import { Vitals } from '@/types/health-records.types';
import { cn } from '@/lib/utils';

interface VitalsSummaryProps {
  vitals: Vitals;
  className?: string;
}

const VitalsSummary = ({ vitals, className }: VitalsSummaryProps) => {
  const vitalsList = [
    { label: 'Heart Rate', value: vitals.heartRate },
    { label: 'Blood Pressure', value: vitals.bloodPressure },
    { label: 'Temperature', value: vitals.temperature },
    { label: 'Oxygen (O₂)', value: vitals.oxygen },
  ];

  return (
    <div
      className={cn(
        'border border-(--border-stroke) flex flex-col gap-4 items-start px-4 sm:px-5 py-3 sm:py-[15px] rounded-[10px] w-full',
        className
      )}
    >
      <p className="font-bold leading-[1.2] text-(--text-primary) text-[14px] sm:text-[16px] w-full">
        Vitals Summary
      </p>
      <div className="flex flex-col gap-3 sm:gap-[14px] items-start w-full">
        {vitalsList.map((vital, index) => (
          <div
            key={index}
            className="flex gap-1 sm:gap-2 items-center leading-[1.2] text-[12px] sm:text-[14px] w-full"
          >
            <p className="flex-1 font-normal text-(--text-secondary)">
              {vital.label}
            </p>
            <p className="flex-1 font-bold text-(--text-primary) text-right">
              {vital.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VitalsSummary;
