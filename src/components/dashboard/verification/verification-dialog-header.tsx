import {
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface VerificationDialogHeaderProps {
  patientName: string;
}

const VerificationDialogHeader = ({
  patientName,
}: VerificationDialogHeaderProps) => {
  return (
    <AlertDialogHeader className="items-start text-left p-0">
      <AlertDialogTitle className="font-bold leading-[20px] text-(--text-dark) text-[16px]">
        Verify Patient Identity
      </AlertDialogTitle>
      <AlertDialogDescription className="font-normal leading-[20px] text-(--text-gray) text-[14px] mt-[2px]">
        Verify access to {patientName}&apos;s profile
      </AlertDialogDescription>
    </AlertDialogHeader>
  );
};

export default VerificationDialogHeader;
