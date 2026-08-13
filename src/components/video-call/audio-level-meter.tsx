'use client';

import { cn } from '@/lib/utils';

interface AudioLevelMeterProps {
  level: number;
  segments?: number;
  className?: string;
}

function segmentColor(position: number) {
  if (position > 88) return 'bg-(--border-red)';
  if (position > 70) return 'bg-amber-400';
  return 'bg-brand-blue';
}

export default function AudioLevelMeter({
  level,
  segments = 24,
  className,
}: AudioLevelMeterProps) {
  const active = Math.max(0, Math.min(100, level));

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role="meter"
      aria-valuenow={Math.round(active)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {Array.from({ length: segments }, (_, index) => {
        const position = ((index + 1) / segments) * 100;
        const lit = active >= position;
        return (
          <span
            key={index}
            className={cn(
              'h-2 flex-1 rounded-[2px] transition-colors duration-75',
              lit ? segmentColor(position) : 'bg-black/10'
            )}
          />
        );
      })}
    </div>
  );
}
