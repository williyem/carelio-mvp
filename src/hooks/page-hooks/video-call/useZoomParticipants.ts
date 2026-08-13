'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Room, RemoteParticipant } from 'livekit-client';
import { RoomEvent, Track } from 'livekit-client';
import { toast } from 'sonner';

export interface CallParticipant {
  userId: string;
  displayName: string;
  bVideoOn: boolean;
  muted: boolean;
  participant: RemoteParticipant;
}

function toCallParticipant(p: RemoteParticipant): CallParticipant {
  const camera = p.getTrackPublication(Track.Source.Camera);
  const mic = p.getTrackPublication(Track.Source.Microphone);
  return {
    userId: p.identity,
    displayName: p.name || p.identity,
    bVideoOn: Boolean(camera?.isSubscribed && !camera.isMuted && camera.track),
    muted: !mic || mic.isMuted,
    participant: p,
  };
}

export function useZoomParticipants(client: Room | null) {
  const [participants, setParticipants] = useState<CallParticipant[]>([]);

  const refreshParticipants = useCallback(() => {
    if (!client) return;
    setParticipants(
      Array.from(client.remoteParticipants.values()).map(toCallParticipant)
    );
  }, [client]);

  useEffect(() => {
    if (!client) return;

    const handleJoined = (participant: RemoteParticipant) => {
      refreshParticipants();
      toast.success(
        `${participant.name || participant.identity} joined the meeting`
      );
    };

    const handleLeft = (participant: RemoteParticipant) => {
      refreshParticipants();
      toast.info(
        `${participant.name || participant.identity} left the meeting`
      );
    };

    client.on(RoomEvent.ParticipantConnected, handleJoined);
    client.on(RoomEvent.ParticipantDisconnected, handleLeft);
    client.on(RoomEvent.TrackSubscribed, refreshParticipants);
    client.on(RoomEvent.TrackUnsubscribed, refreshParticipants);
    client.on(RoomEvent.TrackMuted, refreshParticipants);
    client.on(RoomEvent.TrackUnmuted, refreshParticipants);
    const timer = window.setTimeout(refreshParticipants, 0);

    return () => {
      window.clearTimeout(timer);
      client.off(RoomEvent.ParticipantConnected, handleJoined);
      client.off(RoomEvent.ParticipantDisconnected, handleLeft);
      client.off(RoomEvent.TrackSubscribed, refreshParticipants);
      client.off(RoomEvent.TrackUnsubscribed, refreshParticipants);
      client.off(RoomEvent.TrackMuted, refreshParticipants);
      client.off(RoomEvent.TrackUnmuted, refreshParticipants);
    };
  }, [client, refreshParticipants]);

  return participants;
}
