'use client';

import { Button } from '@/components/ui/button';

interface RecordsLockedCardProps {
  onVerify: () => void;
}

const RecordsLockedCard = ({ onVerify }: RecordsLockedCardProps) => {
  return (
    <div className="bg-[#EBF5FF] w-full border border-[#D6E9F8] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="space-y-1 flex-1">
        <h4 className="text-[15px] font-bold text-gray-900">
          Records are locked
        </h4>
        <p className="text-sm text-gray-600">
          Verify the patient&apos;s email to view their chart. Access lasts 24
          hours.
        </p>
      </div>
      <Button
        variant="brand"
        onClick={onVerify}
        className="h-[44px] rounded-full px-6 shrink-0"
      >
        Verify to view records
      </Button>
    </div>
  );
};

export default RecordsLockedCard;
