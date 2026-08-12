'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  TestMicrophoneReturn,
  TestSpeakerReturn,
  LocalAudioTrack,
  LocalVideoTrack,
} from '@zoom/videosdk';
import { MediaDevice } from '@/components/video-call/preview/types';

export function useZoomDevices() {
  const [micList, setMicList] = useState<MediaDevice[]>([]);
  const [speakerList, setSpeakerList] = useState<MediaDevice[]>([]);
  const [cameraList, setCameraList] = useState<MediaDevice[]>([]);
  const [activeMicrophone, setActiveMicrophone] = useState('');
  const [activeSpeaker, setActiveSpeaker] = useState('');
  const [activeCamera, setActiveCamera] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const localAudioRef = useRef<LocalAudioTrack | null>(null);
  const localVideoRef = useRef<LocalVideoTrack | null>(null);
  const speakerTesterRef = useRef<TestSpeakerReturn | null>(null);
  const microphoneTesterRef = useRef<TestMicrophoneReturn | null>(null);

  const mountDevices = useCallback(async () => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const ZoomVideo = (await import('@zoom/videosdk')).default;

      if (!localAudioRef.current) {
        localAudioRef.current = ZoomVideo.createLocalAudioTrack();
      }
      if (!localVideoRef.current) {
        localVideoRef.current = ZoomVideo.createLocalVideoTrack();
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.warn('Media devices not supported or insecure context');
        setIsLoading(false);
        return;
      }

      const allDevices = await ZoomVideo.getDevices();

      const cameras = allDevices
        .filter((device) => device.kind === 'videoinput')
        .map((item) => ({ label: item.label, deviceId: item.deviceId }));

      const mics = allDevices
        .filter((device) => device.kind === 'audioinput')
        .map((item) => ({ label: item.label, deviceId: item.deviceId }));

      const speakers = allDevices
        .filter((device) => device.kind === 'audiooutput')
        .map((item) => ({ label: item.label, deviceId: item.deviceId }));

      setCameraList(cameras);
      setMicList(mics);
      setSpeakerList(speakers);

      if (speakers.length > 0) setActiveSpeaker(speakers[0].deviceId);
      if (mics.length > 0) setActiveMicrophone(mics[0].deviceId);
      if (cameras.length > 0) setActiveCamera(cameras[0].deviceId);

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountDevices();
  }, [mountDevices]);

  const switchCamera = useCallback(
    async (deviceId: string) => {
      if (typeof window === 'undefined') return;
      if (localVideoRef.current && activeCamera !== deviceId) {
        try {
          await localVideoRef.current.switchCamera(deviceId);
          setActiveCamera(deviceId);
        } catch (error: unknown) {
          const errorName = error instanceof Error ? error.name : '';
          // Ignore VideoNotStartedError - video needs to be started first
          if (errorName !== 'VideoNotStartedError') {
            console.error('Error switching camera:', error);
          }
        }
      }
    },
    [activeCamera]
  );

  const switchMicrophone = useCallback((deviceId: string) => {
    setActiveMicrophone(deviceId);
    if (speakerTesterRef.current) {
      speakerTesterRef.current.destroy();
      speakerTesterRef.current = null;
    }
  }, []);

  const switchSpeaker = useCallback((deviceId: string) => {
    setActiveSpeaker(deviceId);
  }, []);

  return {
    micList,
    speakerList,
    cameraList,
    activeMicrophone,
    activeSpeaker,
    activeCamera,
    setActiveMicrophone,
    setActiveSpeaker,
    setActiveCamera,
    switchCamera,
    switchMicrophone,
    switchSpeaker,
    localAudioRef,
    localVideoRef,
    speakerTesterRef,
    microphoneTesterRef,
    isLoading,
  };
}
