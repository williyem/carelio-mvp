'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ZoomClientType } from '@/stores/video-call-store';

export function useAudioLevel(client: ZoomClientType | null): number {
  const [level, setLevel] = useState(0);

  const onAudioLevelChange = useCallback(({ level }: { level: number }) => {
    // Level is 0-9. Ignore 1 if it's just background noise.
    const effectiveLevel = level > 1 ? level : 0;
    if (effectiveLevel > 0) {
      console.log('--- Local Audio Level ---', effectiveLevel);
    }
    setLevel(effectiveLevel);
  }, []);

  useEffect(() => {
    if (!client) return;

    console.log('--- Attaching current-audio-level-change listener ---');
    client.on('current-audio-level-change', onAudioLevelChange);

    return () => {
      console.log('--- Detaching current-audio-level-change listener ---');
      client.off('current-audio-level-change', onAudioLevelChange);
    };
  }, [client, onAudioLevelChange]);

  return level;
}
