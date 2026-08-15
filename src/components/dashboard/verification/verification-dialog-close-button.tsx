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
      className="absolute right-5 top-5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-(--border-stroke) bg-(--bg-primary) text-(--text-secondary) transition-colors hover:bg-(--bg-light-gray) hover:text-(--text-primary)"
      aria-label="Close dialog"
    >
      <CloseSvg className="h-5 w-5" />
    </button>
  );
};

export default VerificationDialogCloseButton;
