/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import type { ZoomClientType } from '@/stores/video-call-store';

import { toast } from 'sonner';

export function useZoomParticipants(client: ZoomClientType | null) {
  const [participants, setParticipants] = useState<any[]>([]);

  const refreshParticipants = useCallback(() => {
    if (!client) return;
    setParticipants(client.getAllUser().map((user) => ({ ...user })));
  }, [client]);

  useEffect(() => {
    if (!client) return;

    // Type definition for user payload if available, otherwise any
    const handleUserAdded = (payload: any[]) => {
      refreshParticipants();
      payload.forEach((user) => {
        toast.success(
          `${user.displayName || 'A participant'} joined the meeting`
        );
      });
    };

    const handleUserRemoved = (payload: any[]) => {
      refreshParticipants();
      payload.forEach((user) => {
        toast.info(`${user.displayName || 'A participant'} left the meeting`);
      });
    };

    client.on('user-added', handleUserAdded);
    client.on('user-removed', handleUserRemoved);
    client.on('user-updated', refreshParticipants);
    client.on('peer-audio-state-change', refreshParticipants);
    client.on('peer-video-state-change', refreshParticipants);

    setTimeout(() => {
      refreshParticipants();
    }, 0);

    return () => {
      client.off('user-added', handleUserAdded);
      client.off('user-removed', handleUserRemoved);
      client.off('user-updated', refreshParticipants);
      client.off('peer-audio-state-change', refreshParticipants);
      client.off('peer-video-state-change', refreshParticipants);
    };
  }, [client, refreshParticipants]);

  return participants;
}
