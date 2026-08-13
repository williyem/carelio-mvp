'use client';

import { cn } from '@/lib/utils';

const SPEAKING_THRESHOLD = 8;

interface SpeakingRingProps {
  level: number;
  muted?: boolean;
  radius?: number;
  className?: string;
}

export default function SpeakingRing({
  level,
  muted = false,
  radius = 30,
  className,
}: SpeakingRingProps) {
  const active = muted ? 0 : Math.max(0, Math.min(100, level));
  const isSpeaking = active >= SPEAKING_THRESHOLD;
  const intensity = Math.min(1, active / 55);

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 z-10 transition-opacity duration-150 ease-out',
        className
      )}
      style={{
        borderRadius: radius,
        opacity: isSpeaking ? 0.45 + intensity * 0.55 : 0,
        boxShadow: `inset 0 0 0 ${2 + intensity * 1.5}px rgba(77, 162, 255, 0.9), inset 0 0 ${14 + intensity * 20}px rgba(77, 162, 255, 0.3)`,
      }}
    />
  );
}
