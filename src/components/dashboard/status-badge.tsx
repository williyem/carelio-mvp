'use client';

import { isBefore, parseISO } from 'date-fns';

interface StatusBadgeProps {
  status?: string;
  startTime?: string;
  endTime?: string;
}

const StatusBadge = ({
  status: initialStatus,
  startTime,
  endTime,
}: StatusBadgeProps) => {
  const status = initialStatus;
  if (!status) return null;

  const now = new Date();
  const startObj = startTime ? parseISO(startTime) : null;
  const endObj = endTime ? parseISO(endTime) : null;
  const isOngoing =
    startObj && endObj && !isBefore(now, startObj) && isBefore(now, endObj);

  let label = status;
  let className = '';

  switch (status.toUpperCase()) {
    case 'CANCELLED':
      label = 'Cancelled';
      className =
        'bg-red-50 text-red-600 border-red-100/50 px-2.5 py-[5px] rounded-full text-[12px] font-normal border ';
      break;

    case 'IN_PROGRESS':
      label = 'In progress';
      className =
        'bg-emerald-50 text-emerald-700 border-emerald-100/50 px-2.5 py-[5px] rounded-full text-[12px] font-normal border ';
      break;

    case 'CONFIRMED':
    case 'PENDING_CONFIRMATION':
      if (startObj && isBefore(now, startObj)) {
        label = 'Upcoming';
        className =
          'bg-blue-50 text-brand-blue border-blue-100/50 px-2.5 py-[5px] rounded-full text-[12px] font-normal border ';
      } else if (isOngoing) {
        label = 'Ongoing';
        className =
          'bg-emerald-50 text-emerald-700 border-emerald-100/50 px-2.5 py-[5px] rounded-full text-[12px] font-normal border ';
      } else {
        label = 'Confirmed';
        className =
          'bg-blue-50 text-brand-blue border-blue-100/50 px-2.5 py-[5px] rounded-full text-[12px] font-normal border  ';
      }
      break;

    case 'COMPLETED':
      label = 'Completed';
      className =
        'bg-green-100 text-green-600 border-green-200 px-2.5 py-[5px] rounded-full text-[12px] font-normal border ';
      break;

    case 'MISSED':
      label = 'Missed';
      className =
        'bg-gray-50 text-gray-400 border-gray-200 px-2.5 py-[5px] rounded-full text-[12px] font-normal border ';
      break;

    default:
      className =
        'bg-gray-50 text-gray-500 border-gray-200 px-2.5 py-[5px] rounded-full text-[12px] font-normal border ';
  }

  return (
    <div className="flex items-center">
      <span className={className}>{label}</span>
    </div>
  );
};

export default StatusBadge;
