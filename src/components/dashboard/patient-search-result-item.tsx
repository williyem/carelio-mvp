'use client';

import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserSvg from '@/assets/icons/user-svg';
import { AssignedPatient } from '@/integration/patient/type';

interface PatientSearchResultItemProps {
  patient: AssignedPatient;
  onClick?: (patient: AssignedPatient) => void;
  className?: string;
}

const PatientSearchResultItem = ({
  patient,
  onClick,
  className,
}: PatientSearchResultItemProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(patient);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 transition-colors ',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3 items-center">
        <div className="rounded-full bg-(--offset-bg) h-[40px] w-[40px] sm:h-[71px] sm:w-[71px] flex items-center justify-center p-[6px] sm:p-[8px] outline-solid ou outline-offset-2 outline-[#DCE0E6] sm:outline-offset-[2.6px] outline-2 sm:outline-[2.3px]">
          <UserSvg className="w-[28px] h-[28px]  sm:w-[35px] sm:h-[35px]" />
        </div>
        <div className="flex flex-col gap-[2px] sm:gap-[3px] items-start w-[140px] sm:w-[169px] min-w-0">
          <p className="font-normal leading-[1.2] text-(--text-primary) text-[16px] sm:text-[18px] w-full truncate">
            {patient?.fullName || patient?.patientId}
          </p>
          <p className="font-normal leading-[1.2] text-(--text-secondary) text-[10px] sm:text-[12px] w-full truncate">
            {patient?.email || patient?.phoneNumber}
          </p>
          {patient?.isRegistrationComplete ? null : (
            <p className="text-xs text-red-500">Incomplete Registration</p>
          )}
        </div>
      </div>
      <div className="flex items-center shrink-0">
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-(--text-secondary)" />
      </div>
    </div>
  );
};

export default PatientSearchResultItem;
