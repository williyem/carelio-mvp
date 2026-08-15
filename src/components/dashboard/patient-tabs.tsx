'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientTab } from '@/types/patient.types';

interface PatientTabsProps {
  defaultValue?: PatientTab;
  onValueChange?: (value: PatientTab) => void;
  className?: string;
}

const PatientTabs = ({
  defaultValue = 'appointments',
  onValueChange,
  className,
}: PatientTabsProps) => {
  const [value, setValue] = useState<PatientTab>(defaultValue);

  const handleValueChange = (newValue: string) => {
    const tabValue = newValue as PatientTab;
    setValue(tabValue);
    if (onValueChange) {
      onValueChange(tabValue);
    }
  };

  return (
    <Tabs value={value} onValueChange={handleValueChange} className={className}>
      <TabsList className="bg-(--bg-primary) h-[57px] p-[5px] rounded-[100px] w-[340px] max-sm:w-auto">
        <TabsTrigger
          value="appointments"
          className="flex-1 h-full rounded-[100px] data-[state=active]:bg-(--bg-white) data-[state=active]:border data-[state=active]:border-(--border-stroke) data-[state=active]:shadow-sm text-[14px] font-medium leading-[1.2]"
        >
          Appointments
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default PatientTabs;
