import CloseSvg from '@/assets/icons/close-svg';

interface VerificationDialogCloseButtonProps {
  onClose: () => void;
}

const VerificationDialogCloseButton = ({
  onClose,
}: VerificationDialogCloseButtonProps) => {
  return (
    <button
      onClick={onClose}
      className="absolute right-5 top-5 w-6 h-6 flex items-center justify-center hover:bg-gray-100 cursor-pointer rounded-full transition-colors"
      aria-label="Close dialog"
    >
      <CloseSvg />
    </button>
  );
};

export default VerificationDialogCloseButton;
