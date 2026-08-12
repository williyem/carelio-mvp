'use client';

import MuteSvg from '@/assets/icons/mute-svg';

interface MuteIndicatorProps {
  className?: string;
}

export default function MuteIndicator({ className }: MuteIndicatorProps) {
  return (
    <div
      className={`absolute top-2 right-2 z-10 flex items-center justify-center rounded-full bg-black/70 size-6 p-1 ${className || ''}`}
      aria-label="Muted"
      title="Muted"
    >
      <div className="w-4 h-4 flex items-center justify-center">
        <MuteSvg />
      </div>
    </div>
  );
}
