'use client';

import { useState, useEffect } from 'react';
import { useVideoCallStore } from '@/stores/video-call-store';
import ClockStopwatchSvg from '@/assets/icons/clock-stopwatch-svg';

const CallTimer = () => {
  const { selectedAppointment, isActive } = useVideoCallStore();
  const [now, setNow] = useState(() => Date.now());

  const endTime = selectedAppointment?.endTime
    ? new Date(selectedAppointment.endTime).getTime()
    : null;

  useEffect(() => {
    if (!isActive || !endTime) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setNow(Date.now());
    }, 0);

    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [isActive, endTime]);

  let timeLeft = 0;
  if (now && endTime) {
    timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
  }

  const minutesLeft = timeLeft / 60;
  const isNearEnd = minutesLeft <= 15;
  const isCrtiticallyNearEnd = minutesLeft <= 5;

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `-${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(secs).padStart(2, '0')}`;
  };

  if (!isActive || !endTime) return null;

  return (
    <>
      <style>
        {`
          @keyframes timer-pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-timer-pulse {
            animation: timer-pulse 1.5s infinite ease-in-out;
          }
        `}
      </style>
      <div
        className={`flex gap-1 sm:gap-[6px] items-center px-3 sm:px-[20px] py-2 sm:py-[12px] rounded-[1000px] transition-all duration-300 ${
          isCrtiticallyNearEnd
            ? 'bg-red-600 animate-timer-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]'
            : isNearEnd
              ? 'bg-red-500'
              : 'bg-(--bg-video-dark)'
        }`}
      >
        <div className="size-4 max-sm:hidden sm:size-[24px]">
          <ClockStopwatchSvg />
        </div>
        <p className="text-white text-xs sm:text-[16px] font-bold leading-[20px]">
          {formatTime(timeLeft)}
        </p>
      </div>
    </>
  );
};

export default CallTimer;
