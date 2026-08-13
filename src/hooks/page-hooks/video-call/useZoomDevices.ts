'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MediaDevice } from '@/components/video-call/preview/types';

function mapDevices(devices: MediaDeviceInfo[], kind: MediaDeviceKind) {
  return devices
    .filter((device) => device.kind === kind)
    .map((item) => ({
      label: item.label || `${kind} ${item.deviceId.slice(0, 6)}`,
      deviceId: item.deviceId,
    }));
}

export function useZoomDevices() {
  const [micList, setMicList] = useState<MediaDevice[]>([]);
  const [speakerList, setSpeakerList] = useState<MediaDevice[]>([]);
  const [cameraList, setCameraList] = useState<MediaDevice[]>([]);
  const [activeMicrophone, setActiveMicrophone] = useState('');
  const [activeSpeaker, setActiveSpeaker] = useState('');
  const [activeCamera, setActiveCamera] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const previewStreamRef = useRef<MediaStream | null>(null);

  const stopPreviewStream = useCallback(() => {
    previewStreamRef.current?.getTracks().forEach((track) => track.stop());
    previewStreamRef.current = null;
  }, []);

  const mountDevices = useCallback(async () => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        setIsLoading(false);
        return;
      }

      const permissionStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      permissionStream.getTracks().forEach((track) => track.stop());

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const cameras = mapDevices(allDevices, 'videoinput');
      const mics = mapDevices(allDevices, 'audioinput');
      const speakers = mapDevices(allDevices, 'audiooutput');

      setCameraList(cameras);
      setMicList(mics);
      setSpeakerList(speakers);

      if (speakers.length > 0) setActiveSpeaker(speakers[0].deviceId);
      if (mics.length > 0) setActiveMicrophone(mics[0].deviceId);
      if (cameras.length > 0) setActiveCamera(cameras[0].deviceId);
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountDevices();
    return () => stopPreviewStream();
  }, [mountDevices, stopPreviewStream]);

  const switchCamera = useCallback(async (deviceId: string) => {
    setActiveCamera(deviceId);
  }, []);

  const switchMicrophone = useCallback((deviceId: string) => {
    setActiveMicrophone(deviceId);
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
    previewStreamRef,
    stopPreviewStream,
    isLoading,
  };
}
