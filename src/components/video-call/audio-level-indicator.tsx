'use client';

import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const BAR_WEIGHTS = [0.5, 0.78, 1, 0.78, 0.5];
const SPEAKING_THRESHOLD = 8;

const SIZES = {
  sm: {
    barWidth: 2.5,
    barHeight: 12,
    gap: 2.5,
    iconSize: 11,
    container: 'gap-1 px-1.5 py-1',
    label: 'text-[10px] max-w-[70px]',
  },
  md: {
    barWidth: 3,
    barHeight: 16,
    gap: 3,
    iconSize: 14,
    container: 'gap-1.5 px-2.5 py-1.5',
    label: 'text-xs max-w-[160px]',
  },
} as const;

interface AudioLevelIndicatorProps {
  level: number;
  muted?: boolean;
  label?: string;
  size?: keyof typeof SIZES;
  className?: string;
}

export default function AudioLevelIndicator({
  level,
  muted = false,
  label,
  size = 'md',
  className,
}: AudioLevelIndicatorProps) {
  const {
    barWidth,
    barHeight,
    gap,
    iconSize,
    container,
    label: labelClass,
  } = SIZES[size];
  const active = muted ? 0 : Math.max(0, Math.min(100, level));
  const isSpeaking = active >= SPEAKING_THRESHOLD;

  return (
    <div
      className={cn(
        'pointer-events-none absolute bottom-3 left-3 z-20 flex items-center rounded-full border border-white/10 bg-black/45 backdrop-blur-md transition-colors duration-200',
        container,
        className
      )}
      style={{
        boxShadow: isSpeaking
          ? '0 0 0 1px rgba(77, 162, 255, 0.45), 0 0 14px rgba(77, 162, 255, 0.35)'
          : undefined,
      }}
      aria-label={muted ? 'Microphone muted' : `Audio level ${active} percent`}
    >
      {muted ? (
        <MicOff
          size={iconSize}
          strokeWidth={2.2}
          className="shrink-0 text-(--border-red)"
        />
      ) : (
        <Mic
          size={iconSize}
          strokeWidth={2.2}
          className={cn(
            'shrink-0 transition-colors duration-200',
            isSpeaking ? 'text-white' : 'text-white/60'
          )}
        />
      )}

      <div className="flex items-center" style={{ gap, height: barHeight }}>
        {BAR_WEIGHTS.map((weight, index) => {
          const fill = muted
            ? 0.12
            : Math.max(0.12, Math.min(1, (active / 100) * weight * 1.6));
          return (
            <span
              key={index}
              className="relative overflow-hidden rounded-full bg-white/20"
              style={{ width: barWidth, height: barHeight }}
            >
              <span
                className={cn(
                  'absolute inset-x-0 bottom-0 h-full rounded-full transition-transform duration-100 ease-out',
                  muted ? 'bg-white/25' : 'bg-brand-blue'
                )}
                style={{
                  transform: `scaleY(${fill})`,
                  transformOrigin: 'bottom',
                }}
              />
            </span>
          );
        })}
      </div>

      {label && (
        <span
          className={cn(
            'truncate font-medium text-white/90 leading-none',
            labelClass
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}
