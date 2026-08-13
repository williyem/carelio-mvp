import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useVideoCallStore } from '@/stores/video-call-store';
import { RoomEvent, Track } from 'livekit-client';
import VideoPlaceholder from './video-placeholder';
import AudioLevelIndicator from './audio-level-indicator';
import SpeakingRing from './speaking-ring';
import { useAudioLevel } from '@/hooks/page-hooks/video-call/useAudioLevel';

const VideoCallSelfView = () => {
  const { client, isVideoPaused, isMuted } = useVideoCallStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const audioLevel = useAudioLevel(client?.localParticipant);

  useEffect(() => {
    if (!client) return;
    const el = videoRef.current;

    const attach = () => {
      const publication = client.localParticipant.getTrackPublication(
        Track.Source.Camera
      );
      const track = publication?.track;
      if (!el || !track || isVideoPaused || publication?.isMuted) {
        setIsCapturing(false);
        return;
      }
      track.attach(el);
      setIsCapturing(true);
    };

    attach();
    client.on(RoomEvent.LocalTrackPublished, attach);
    client.on(RoomEvent.TrackMuted, attach);
    client.on(RoomEvent.TrackUnmuted, attach);

    return () => {
      client.off(RoomEvent.LocalTrackPublished, attach);
      client.off(RoomEvent.TrackMuted, attach);
      client.off(RoomEvent.TrackUnmuted, attach);
      const publication = client.localParticipant.getTrackPublication(
        Track.Source.Camera
      );
      if (el && publication?.track) {
        publication.track.detach(el);
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
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      {!isCapturing && (
        <div className="absolute inset-0 flex flex-col gap-1 sm:gap-[5px] items-center justify-center bg-(--bg-video-darker) z-10 pointer-events-none">
          <VideoPlaceholder size="small" />
          <p className="text-(--bg-video-gray) text-xs sm:text-[14px] font-normal leading-[1.2] text-center">
            You
          </p>
        </div>
      )}
      <SpeakingRing
        level={audioLevel}
        muted={isMuted}
        radius={20}
        className="z-20"
      />
      <AudioLevelIndicator
        level={audioLevel}
        muted={isMuted}
        size="sm"
        className="bottom-2 left-2 z-30"
      />
    </motion.div>
  );
};

export default VideoCallSelfView;
