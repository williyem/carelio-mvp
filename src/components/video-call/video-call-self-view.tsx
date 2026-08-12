import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useVideoCallStore } from '@/stores/video-call-store';
import { VideoQuality } from '@zoom/videosdk';
import VideoPlaceholder from './video-placeholder';
import MuteIndicator from './mute-indicator';

const VideoCallSelfView = () => {
  const { client, isVideoPaused } = useVideoCallStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const currentUser = client?.getCurrentUserInfo();
  const isMuted = currentUser?.muted === true;

  useEffect(() => {
    if (!client) return;
    const mediaStream = client.getMediaStream();
    const userId = client.getCurrentUserInfo().userId;

    const renderSelfVideo = async () => {
      try {
        if (!isVideoPaused && mediaStream.isCapturingVideo()) {
          setIsCapturing(true);
          const el = await mediaStream.attachVideo(
            userId,
            VideoQuality.Video_360P
          );

          if (el && containerRef.current) {
            const videoEl = el as HTMLElement;
            Object.assign(videoEl.style, {
              width: '100%',
              height: '100%',
              position: 'absolute',
              inset: '0',
              objectFit: 'cover',
              display: 'block',
              transform: 'scale(1.01)',
            });

            // Recreate the container to ensure clean state
            containerRef.current.innerHTML = '';
            const container = document.createElement('video-player-container');
            Object.assign(container.style, {
              width: '100%',
              height: '100%',
              position: 'absolute',
              inset: '0',
              display: 'block',
            });
            container.appendChild(videoEl);
            containerRef.current.appendChild(container);
          }
        } else {
          setIsCapturing(false);
          await mediaStream.detachVideo(userId);
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
          }
        }
      } catch (error) {
        console.error('Failed to render self video:', error);
      }
    };

    client.on('video-active-change', renderSelfVideo);
    renderSelfVideo();

    return () => {
      client.off('video-active-change', renderSelfVideo);
      if (mediaStream.isCapturingVideo()) {
        mediaStream.detachVideo(userId).catch(() => {});
      }
    };
  }, [client, isVideoPaused]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="absolute bottom-5 right-5 bg-(--bg-video-darker) border border-(--bg-video-medium) w-[206px] aspect-video rounded-[20px] overflow-hidden flex items-center justify-center cursor-move z-50 shadow-lg"
      style={{ touchAction: 'none' }}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      {!isCapturing && (
        <div className="absolute inset-0 flex flex-col gap-1 sm:gap-[5px] items-center justify-center bg-(--bg-video-darker) z-10 pointer-events-none">
          <VideoPlaceholder size="small" />
          <p className="text-(--bg-video-gray) text-xs sm:text-[14px] font-normal leading-[1.2] text-center">
            You
          </p>
        </div>
      )}
      {isMuted && <MuteIndicator />}
    </motion.div>
  );
};

export default VideoCallSelfView;
