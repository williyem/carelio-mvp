'use client';

import { useRef, useMemo } from 'react';
import { useVideoCallStore } from '@/stores/video-call-store';
import { useZoomParticipants } from '@/hooks/page-hooks/video-call/useZoomParticipants';
import { VideoPlayer } from './video-player';
import VideoCallSelfView from './video-call-self-view';
import CallControls from './call-controls';
import LargeVideoSvg from '@/assets/icons/large-video-svg';

const VideoCallMainArea = ({
  leaveSession,
}: {
  leaveSession: () => Promise<void>;
}) => {
  const { client } = useVideoCallStore();
  const participants = useZoomParticipants(client);
  const remoteContainerRef = useRef<HTMLDivElement>(null);

  const currentUserId = client?.localParticipant.identity;
  const firstRemoteParticipant = useMemo(() => {
    if (!currentUserId) return undefined;

    return participants.find((p) => p.userId !== currentUserId);
  }, [participants, currentUserId]);

  return (
    <div className="flex-1 min-h-0 py-[22px] pb-[40px] px-[45px] max-sm:px-4 max-sm:py-4">
      <div className="space-y-10 h-full flex flex-col justify-between">
        <div
          ref={remoteContainerRef}
          className="flex-1 relative bg-(--bg-video-dark) border border-(--border-video) rounded-[30px] flex items-center justify-center overflow-hidden"
          onClick={() => {
            void client?.startAudio();
          }}
        >
          {!firstRemoteParticipant && (
            <div className="space-y-5 text-center">
              <div className="size-[150px] bg-(--bg-video-medium) rounded-full flex items-center justify-center mx-auto">
                <LargeVideoSvg />
              </div>
              <div className="space-y-3">
                <p className="text-[18px] font-bold text-white">
                  Video Call Active
                </p>
                <p className="text-(--bg-video-gray) text-[14px] font-normal leading-[1.2]">
                  Waiting for Patient to join…
                </p>
              </div>
            </div>
          )}

          {/* Render Remote Video if available */}
          {firstRemoteParticipant && client && (
            <VideoPlayer
              participant={firstRemoteParticipant}
              client={client}
              className="absolute inset-0 w-full h-full object-cover"
              scale={1.05}
            />
          )}

          {/* Self View (Bottom Right) */}
          <VideoCallSelfView />
        </div>

        {/* Controls at Bottom */}
        <div className="z-10 w-full flex justify-center">
          <CallControls variant="fullscreen" handleEndCall={leaveSession} />
        </div>
      </div>
    </div>
  );
};

export default VideoCallMainArea;
