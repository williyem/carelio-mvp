'use client';

import { useEffect, useState } from 'react';
import {
  createAudioAnalyser,
  isAudioTrack,
  ParticipantEvent,
  Track,
  type LocalAudioTrack,
  type Participant,
  type RemoteAudioTrack,
} from 'livekit-client';

export function useAudioLevel(
  participant: Participant | null | undefined
): number {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!participant) {
      return undefined;
    }

    let intervalId: number | undefined;
    let cleanupAnalyser: (() => Promise<void>) | undefined;

    const teardown = () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
      const cleanup = cleanupAnalyser;
      cleanupAnalyser = undefined;
      void cleanup?.();
    };

    const setup = () => {
      teardown();

      const publication = participant.getTrackPublication(
        Track.Source.Microphone
      );
      const track = publication?.track;
      if (!track || !isAudioTrack(track) || publication.isMuted) {
        return;
      }

      try {
        const { calculateVolume, cleanup } = createAudioAnalyser(
          track as LocalAudioTrack | RemoteAudioTrack,
          { fftSize: 256, smoothingTimeConstant: 0.5 }
        );
        cleanupAnalyser = cleanup;
        intervalId = window.setInterval(() => {
          setLevel(Math.min(100, Math.round(calculateVolume() * 400)));
        }, 50);
      } catch {
        intervalId = window.setInterval(() => {
          setLevel(Math.min(100, Math.round(participant.audioLevel * 100)));
        }, 50);
      }
    };

    setup();
    participant.on(ParticipantEvent.TrackSubscribed, setup);
    participant.on(ParticipantEvent.TrackUnsubscribed, setup);
    participant.on(ParticipantEvent.TrackMuted, setup);
    participant.on(ParticipantEvent.TrackUnmuted, setup);
    participant.on(ParticipantEvent.LocalTrackPublished, setup);
    participant.on(ParticipantEvent.LocalTrackUnpublished, setup);

    return () => {
      teardown();
      participant.off(ParticipantEvent.TrackSubscribed, setup);
      participant.off(ParticipantEvent.TrackUnsubscribed, setup);
      participant.off(ParticipantEvent.TrackMuted, setup);
      participant.off(ParticipantEvent.TrackUnmuted, setup);
      participant.off(ParticipantEvent.LocalTrackPublished, setup);
      participant.off(ParticipantEvent.LocalTrackUnpublished, setup);
    };
  }, [participant]);

  return participant ? level : 0;
}
