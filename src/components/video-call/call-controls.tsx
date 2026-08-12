'use client';

import { useVideoCallStore } from '@/stores/video-call-store';
import PhoneEndSvg from '@/assets/icons/phone-end-svg';
import VideoOnSvg from '@/assets/icons/video-on-svg';
import { cn } from '@/lib/utils';
import MuteSvg from '@/assets/icons/mute-svg';
import UnmuteSvg from '@/assets/icons/unmute-svg';

interface CallControlsProps {
  variant?: 'fullscreen' | 'pip';
  handleEndCall: () => Promise<void>;
}

const CallControls = ({
  variant = 'fullscreen',
  handleEndCall,
}: CallControlsProps) => {
  const { client, isMuted, setIsMuted, isVideoPaused, setIsVideoPaused } =
    useVideoCallStore();

  const handleToggleMute = async () => {
    if (!client) return;
    const mediaStream = client.getMediaStream();
    if (isMuted) {
      await mediaStream.unmuteAudio();
      setIsMuted(false);
    } else {
      await mediaStream.muteAudio();
      setIsMuted(true);
    }
  };

  const handleToggleVideo = async () => {
    if (!client) return;
    const mediaStream = client.getMediaStream();
    if (isVideoPaused) {
      await mediaStream.startVideo();
      setIsVideoPaused(false);
    } else {
      await mediaStream.stopVideo();
      setIsVideoPaused(true);
    }
  };

  const containerClass =
    variant === 'fullscreen'
      ? 'backdrop-blur-[10px] max-w-[293px] bg-(--bg-video-dark) flex gap-4 sm:gap-[32px] items-start px-4 sm:px-[33px] py-2 sm:py-[10px] rounded-[10000px]'
      : 'backdrop-blur-[10px] bg-(--bg-video-darker) flex gap-4 sm:gap-[32px] items-start px-4 px-[10px] py-2 sm:py-[10px] rounded-[10000px]';

  return (
    <div className={containerClass}>
      {/* Mute Button */}
      <div className="flex flex-col gap-1 sm:gap-[4px] items-center justify-center">
        <button
          onClick={handleToggleMute}
          className={cn(
            'cursor-pointer rounded-full size-10 sm:size-[46px] flex items-center justify-center transition-colors',
            isMuted
              ? 'bg-(--border-red) hover:bg-(--border-red-hover)'
              : 'bg-(--bg-video-medium) hover:bg-(--bg-video-hover)'
          )}
        >
          {isMuted ? <MuteSvg /> : <UnmuteSvg />}
        </button>
        {variant === 'fullscreen' && (
          <p className="text-white text-[10px] sm:text-[12px] font-medium leading-[12px] hidden sm:block w-[60px] text-center">
            {isMuted ? 'Unmute' : 'Mute'}
          </p>
        )}
      </div>

      {/* Pause Video Button */}
      <div className="flex flex-col gap-1 sm:gap-[4px] items-center justify-center">
        <button
          onClick={handleToggleVideo}
          className={cn(
            'cursor-pointer rounded-full size-10 sm:size-[46px] flex items-center justify-center transition-colors',
            isVideoPaused
              ? 'bg-(--border-red) hover:bg-(--border-red-hover)'
              : 'bg-(--bg-video-medium) hover:bg-(--bg-video-hover)'
          )}
        >
          <VideoOnSvg />
        </button>
        {variant === 'fullscreen' && (
          <p className="text-white text-[10px] sm:text-[12px] font-medium leading-[12px] hidden sm:block ">
            {isVideoPaused ? 'Resume' : 'Pause'}
          </p>
        )}
      </div>

      {/* End Call Button */}
      <div className="flex flex-col gap-1 sm:gap-[4px] items-center justify-center">
        <button
          onClick={handleEndCall}
          className="bg-(--border-red) cursor-pointer rounded-full size-10 sm:size-[46px] flex items-center justify-center hover:bg-(--border-red-hover) transition-colors"
        >
          <PhoneEndSvg />
        </button>
        {variant === 'fullscreen' && (
          <p className="text-white text-[10px] sm:text-[12px] font-medium leading-[12px] hidden sm:block">
            End
          </p>
        )}
      </div>
    </div>
  );
};

export default CallControls;
