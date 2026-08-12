'use client';

import { useVideoCallStore } from '@/stores/video-call-store';
import LiveBadge from './live-badge';
import CallTimer from './call-timer';
import PipExitSvg from '@/assets/icons/pip-exit-svg';
const VideoCallTopbar = () => {
  const { toggleMinimize, selectedPatient } = useVideoCallStore();

  const patient = selectedPatient?.fullName || selectedPatient?.patientId;

  const handleExit = () => {
    toggleMinimize();
  };

  return (
    <>
      <div className=" max-sm:hidden border-b border-(--border-video) flex flex-col sm:flex-row items-center justify-between px-4 sm:px-[44px] py-3 sm:py-[20px] min-h-[64px] sm:h-[84px] gap-2 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-[20px]">
          <p className="text-white text-sm sm:text-[18px] font-normal leading-[1.2] whitespace-nowrap truncate max-w-[150px] sm:max-w-none">
            {patient}
          </p>
          <LiveBadge />
        </div>

        <CallTimer />

        <button
          onClick={handleExit}
          className="flex items-center gap-2  cursor-pointer hover:opacity-80 transition-opacity"
        >
          <PipExitSvg />

          <p className="text-white text-sm sm:text-[18px] font-normal leading-[1.2] whitespace-nowrap">
            Exit
          </p>
        </button>
      </div>
      <div className="border-b sm:hidden border-(--border-video) flex flex-col sm:flex-row items-center justify-between px-4 sm:px-[44px] py-3 sm:py-[20px] min-h-[64px] sm:h-[84px] gap-2 sm:gap-0">
        <div className="flex items-center max-sm:justify-between w-full gap-2 sm:gap-[20px]">
          <p className="text-white text-sm sm:text-[18px] font-normal leading-[1.2] whitespace-nowrap truncate max-w-[150px] sm:max-w-none">
            {patient || 'Patient'}
          </p>
          {/* <LiveBadge /> */}
          <div className="flex items-center gap-x-2">
            <CallTimer />
            <button
              onClick={handleExit}
              className="flex items-center gap-2 sm:hidden  cursor-pointer hover:opacity-80 transition-opacity"
            >
              <PipExitSvg />

              <p className="text-white text-sm sm:text-[18px] font-normal leading-[1.2] whitespace-nowrap">
                Exit
              </p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoCallTopbar;
