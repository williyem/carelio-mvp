'use client';

import { ChevronRight, Mail, Phone } from 'lucide-react';
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

  const contact = patient?.email || patient?.phoneNumber || patient?.phone;
  const ContactIcon = patient?.email ? Mail : Phone;

  return (
    <div
      className={cn(
        'group flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-(--border-stroke) bg-(--bg-white) p-3 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] transition-all hover:-translate-y-0.5 hover:border-brand-blue/35 hover:bg-(--bg-primary) hover:shadow-[0px_10px_28px_0px_rgba(10,13,20,0.08)]',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand-blue/15 bg-brand-blue/10 text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white sm:h-12 sm:w-12">
          <UserSvg className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="w-full truncate text-[15px] font-semibold leading-[1.2] text-(--text-primary) sm:text-[16px]">
            {patient?.fullName || patient?.patientId}
          </p>
          {contact ? (
            <p className="flex w-full items-center gap-1.5 truncate text-[12px] font-normal leading-[1.2] text-(--text-secondary)">
              <ContactIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{contact}</span>
            </p>
          ) : null}
          {patient?.isRegistrationComplete ? null : (
            <span className="mt-1 w-fit rounded-full border border-state-warning-base/25 bg-state-warning-bg px-2 py-0.5 text-[11px] font-medium text-state-warning-base">
              Incomplete registration
            </span>
          )}
        </div>
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--bg-primary) text-(--text-secondary) transition-colors group-hover:bg-brand-blue group-hover:text-white">
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
};

export default PatientSearchResultItem;
