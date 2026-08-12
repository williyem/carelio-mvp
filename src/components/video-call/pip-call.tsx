'use client';
import { useVideoCallStore } from '@/stores/video-call-store';
import CallControls from './call-controls';
import MaximizeSvg from '@/assets/icons/maximize-svg';
import VideoSvg from '@/assets/icons/video-svg';
import { useZoomParticipants } from '@/hooks/page-hooks/video-call/useZoomParticipants';
import { VideoPlayer } from './video-player';

const PipCall = ({ handleEndCall }: { handleEndCall: () => Promise<void> }) => {
  const { toggleMinimize, client } = useVideoCallStore();
  const participants = useZoomParticipants(client);
  const currentUserId = client?.getCurrentUserInfo()?.userId;
  const firstRemoteParticipant = participants.find(
    (p) => p.userId !== currentUserId
  );

  const handleMaximize = () => {
    toggleMinimize();
  };

  return (
    <div className="bg-(--bg-video-dark) border border-(--border-video) flex items-center justify-center rounded-[30px] w-[400px] h-[300px] relative overflow-hidden shadow-2xl">
      {/* Maximize Button */}
      <button
        onClick={handleMaximize}
        className="absolute cursor-pointer  top-[13px] right-[20px] bg-(--bg-video-darker) px-[20px] py-[12px] rounded-[1000px] hover:bg-(--bg-video-darker-hover) transition-colors z-50 shadow-md"
      >
        <div className="size-[24px]">
          <MaximizeSvg />
        </div>
      </button>

      {/* Video Area */}
      {firstRemoteParticipant && client ? (
        <VideoPlayer
          participant={firstRemoteParticipant}
          client={client}
          muteIndicatorPosition="top-left"
          className="absolute inset-0 w-full h-full object-cover"
          scale={1.2}
        />
      ) : (
        <div className="flex flex-col gap-[20px] items-center bg-(--bg-video-medium) rounded-full size-[85px] justify-center">
          <VideoSvg />
        </div>
      )}

      {/* Controls at Bottom */}
      <div className="absolute left-1/2 bottom-[10px] -translate-x-1/2 z-50">
        <CallControls variant="pip" handleEndCall={handleEndCall} />
      </div>
    </div>
  );
};

export default PipCall;
