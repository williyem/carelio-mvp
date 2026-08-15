'use client';

import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
  label?: string;
}

const BackButton = ({
  onClick,
  className,
  label = 'Back',
}: BackButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex gap-[10.747px] items-center justify-center text-(--text-secondary,#656060) hover:opacity-70 transition-opacity',
        className
      )}
    >
      <div className="bg-(--bg-back-button) relative rounded-full w-8 h-8 flex items-center justify-center">
        <ArrowLeft className="w-6 h-6 text-(--text-secondary)" />
      </div>
      <span className="font-bold leading-[38.21px] text-[16px]">{label}</span>
    </button>
  );
};

export default BackButton;
