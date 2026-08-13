'use client';

import { useRef, useEffect, memo } from 'react';
import type { Room } from 'livekit-client';
import { ParticipantEvent, Track } from 'livekit-client';
import AudioLevelIndicator from './audio-level-indicator';
import SpeakingRing from './speaking-ring';
import { useAudioLevel } from '@/hooks/page-hooks/video-call/useAudioLevel';
import type { CallParticipant } from '@/hooks/page-hooks/video-call/useZoomParticipants';

interface VideoPlayerProps {
  participant: CallParticipant;
  client: Room;
  className?: string;
  /** Renders a smaller indicator out of the way of the picture-in-picture controls. */
  compact?: boolean;
  scale?: number;
}

const VideoPlayerComponent = ({
  participant,
  className,
  compact = false,
  scale = 1.01,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isMuted = participant.muted === true;
  const audioLevel = useAudioLevel(participant.participant);

  useEffect(() => {
    const videoEl = videoRef.current;
    const audioEl = audioRef.current;
    const remote = participant.participant;

    const attachMedia = () => {
      const camera = remote.getTrackPublication(Track.Source.Camera);
      const microphone = remote.getTrackPublication(Track.Source.Microphone);

      if (videoEl && camera?.track && participant.bVideoOn) {
        camera.track.attach(videoEl);
      }
      if (audioEl && microphone?.track) {
        microphone.track.attach(audioEl);
        void audioEl.play().catch(() => {});
      }
    };

    attachMedia();
    remote.on(ParticipantEvent.TrackSubscribed, attachMedia);
    remote.on(ParticipantEvent.TrackUnsubscribed, attachMedia);
    remote.on(ParticipantEvent.TrackMuted, attachMedia);
    remote.on(ParticipantEvent.TrackUnmuted, attachMedia);

    return () => {
      remote.off(ParticipantEvent.TrackSubscribed, attachMedia);
      remote.off(ParticipantEvent.TrackUnsubscribed, attachMedia);
      remote.off(ParticipantEvent.TrackMuted, attachMedia);
      remote.off(ParticipantEvent.TrackUnmuted, attachMedia);
      const camera = remote.getTrackPublication(Track.Source.Camera);
      const microphone = remote.getTrackPublication(Track.Source.Microphone);
      if (videoEl && camera?.track) camera.track.detach(videoEl);
      if (audioEl && microphone?.track) microphone.track.detach(audioEl);
    };
  }, [participant.bVideoOn, participant.participant, participant.userId]);

  const getInitials = (name: string) => {
    return (
      name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'P'
    );
  };

  const getColor = (name: string) => {
    const colors = [
      '#FF5733',
      '#33FF57',
      '#3357FF',
      '#F033FF',
      '#FF33A8',
      '#33FFF5',
      '#FF8C33',
      '#8C33FF',
      '#FF3333',
      '#33FF8C',
    ];
    let hash = 0;
    const str = name || 'default';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const displayName = participant.displayName || 'Participant';

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: participant.bVideoOn ? '#000000' : '#1F2B3C',
      }}
    >
      {participant.bVideoOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            borderRadius: 30,
            transform: `scale(${scale})`,
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            style={{
              backgroundColor: getColor(displayName),
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '48px',
              fontWeight: 'bold',
            }}
          >
            {getInitials(displayName)}
          </div>
        </div>
      )}
      <audio ref={audioRef} autoPlay playsInline />
      <SpeakingRing level={audioLevel} muted={isMuted} radius={30} />
      <AudioLevelIndicator
        level={audioLevel}
        muted={isMuted}
        size={compact ? 'sm' : 'md'}
        label={compact ? undefined : displayName}
        className={compact ? 'top-3 left-3 bottom-auto' : undefined}
      />
    </div>
  );
};

export const VideoPlayer = memo(
  VideoPlayerComponent,
  (prevProps: VideoPlayerProps, nextProps: VideoPlayerProps) => {
    return (
      prevProps.participant?.userId === nextProps.participant?.userId &&
      prevProps.participant?.bVideoOn === nextProps.participant?.bVideoOn &&
      prevProps.participant?.muted === nextProps.participant?.muted &&
      prevProps.client === nextProps.client &&
      prevProps.className === nextProps.className &&
      prevProps.compact === nextProps.compact &&
      prevProps.scale === nextProps.scale
    );
  }
);
