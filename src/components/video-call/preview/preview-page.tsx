'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useZoomDevices } from '@/hooks/page-hooks/video-call/useZoomDevices';
import type { LocalAudioTrack } from '@zoom/videosdk';
import VideoPreview from './video-preview';
import ControlBar from './control-bar';
import SpeakerTest from './speaker-test';
import MicrophoneTest from './microphone-test';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useVideoCallStore } from '@/stores/video-call-store';
import { Spinner } from '@/components/ui/spinner';

export default function PreviewPage({
  joinSession,
}: {
  joinSession: () => Promise<boolean>;
}) {
  const {
    micList,
    speakerList,
    cameraList,
    activeMicrophone,
    activeSpeaker,
    activeCamera,
    setActiveMicrophone,
    setActiveSpeaker,
    switchCamera,
    switchMicrophone,
    switchSpeaker,
    localAudioRef,
    localVideoRef,
    speakerTesterRef,
    microphoneTesterRef,
    isLoading,
  } = useZoomDevices();

  const { setPreviewSettings, closePreview, isJoining } = useVideoCallStore();

  const [isStartedAudio, setIsStartedAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isStartedVideo, setIsStartedVideo] = useState(false);
  const [isInVBMode, setIsInVBMode] = useState(false);
  const [outputLevel, setOutputLevel] = useState(0);
  const [inputLevel, setInputLevel] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const audioTrackStartedRef = useRef(false);
  const videoTrackStartedRef = useRef(false);

  const safeStopAudio = useCallback(async (track: LocalAudioTrack | null) => {
    if (!track || !audioTrackStartedRef.current) return;
    try {
      await track.stop();
      audioTrackStartedRef.current = false;
    } catch (error: unknown) {
      const errorName = error instanceof Error ? error.name : '';
      if (
        errorName !== 'AudioNotStartedError' &&
        errorName !== 'VideoNotStartedError'
      ) {
        console.error('Error stopping audio track:', error);
      }
      audioTrackStartedRef.current = false;
    }
  }, []);

  const safeStopVideo = useCallback(
    async (track: { stop: () => Promise<void | Error> } | null) => {
      if (!track || !videoTrackStartedRef.current) return;
      try {
        await track.stop();
        videoTrackStartedRef.current = false;
      } catch (error: unknown) {
        const errorName = error instanceof Error ? error.name : '';
        // Ignore expected errors
        if (errorName !== 'VideoNotStartedError') {
          console.error('Error stopping video track:', error);
        }
        videoTrackStartedRef.current = false;
      }
    },
    []
  );

  const safeMuteAudio = useCallback(
    async (track: LocalAudioTrack | null, mute: boolean) => {
      if (!track || !audioTrackStartedRef.current) return false;
      try {
        if (mute) {
          await track.mute();
        } else {
          await track.unmute();
        }
        return true;
      } catch (error: unknown) {
        const errorName = error instanceof Error ? error.name : '';
        if (
          errorName !== 'AudioAlreadyMutedError' &&
          errorName !== 'AudioAlreadyUnmutedError' &&
          errorName !== 'AudioNotStartedError'
        ) {
          console.error(`Error ${mute ? 'muting' : 'unmuting'} audio:`, error);
        }
        return true;
      }
    },
    []
  );

  useEffect(() => {
    const audioTrack = localAudioRef.current;
    const videoTrack = localVideoRef.current;
    const speakerTester = speakerTesterRef.current;
    const micTester = microphoneTesterRef.current;

    return () => {
      if (audioTrack && audioTrackStartedRef.current) {
        safeStopAudio(audioTrack);
      }
      if (videoTrack && videoTrackStartedRef.current) {
        safeStopVideo(videoTrack);
      }
      if (speakerTester) {
        try {
          speakerTester.destroy();
        } catch (error) {
          console.error('Error destroying speaker tester:', error);
        }
      }
      if (micTester) {
        try {
          micTester.stop();
          micTester.destroy();
        } catch {
          // Ignore cleanup errors
        }
      }
      // Reset input level on cleanup
      setInputLevel(0);
    };
  }, [
    localAudioRef,
    localVideoRef,
    speakerTesterRef,
    microphoneTesterRef,
    safeStopAudio,
    safeStopVideo,
  ]);

  const onCameraClick = useCallback(async () => {
    if (!localVideoRef.current || typeof window === 'undefined') return;

    if (isStartedVideo) {
      if (videoTrackStartedRef.current) {
        await safeStopVideo(localVideoRef.current);
      }
      setIsStartedVideo(false);
      setIsInVBMode(false);
      videoTrackStartedRef.current = false;
    } else {
      try {
        if (videoRef.current && localVideoRef.current) {
          await localVideoRef.current.start(videoRef.current);
          videoTrackStartedRef.current = true;
          setIsStartedVideo(true);
        }
      } catch (error: unknown) {
        const errorName = error instanceof Error ? error.name : '';
        console.error('Error starting video:', error);
        videoTrackStartedRef.current = false;
        setIsStartedVideo(false);
        // If it's a permission error, we might want to show a message
        if (errorName === 'NotAllowedError' || errorName === 'NotFoundError') {
          console.error('Camera permission denied or not found');
        }
      }
    }
  }, [isStartedVideo, localVideoRef, safeStopVideo]);

  const onMicrophoneClick = useCallback(async () => {
    if (!localAudioRef.current || typeof window === 'undefined') return;

    try {
      if (isStartedAudio && audioTrackStartedRef.current) {
        if (isMuted) {
          const success = await safeMuteAudio(localAudioRef.current, false);
          if (success) {
            setIsMuted(false);
          }
        } else {
          const success = await safeMuteAudio(localAudioRef.current, true);
          if (success) {
            setIsMuted(true);
          }
        }
      } else {
        await localAudioRef.current.start();
        audioTrackStartedRef.current = true;
        setIsStartedAudio(true);
        setIsMuted(false);
      }
    } catch (error: unknown) {
      const errorName = error instanceof Error ? error.name : '';
      if (errorName !== 'AudioNotStartedError') {
        console.error('Error toggling microphone:', error);
      }
      if (!isStartedAudio) {
        audioTrackStartedRef.current = false;
        setIsStartedAudio(false);
      }
    }
  }, [isStartedAudio, isMuted, localAudioRef, safeMuteAudio]);

  const onMicrophoneSelect = useCallback(
    async (deviceId: string) => {
      if (
        deviceId !== activeMicrophone &&
        localAudioRef.current &&
        typeof window !== 'undefined'
      ) {
        await safeStopAudio(localAudioRef.current);
        setIsMuted(true);
        setIsStartedAudio(false);

        const ZoomVideo = (await import('@zoom/videosdk')).default;
        localAudioRef.current = ZoomVideo.createLocalAudioTrack(deviceId);
        try {
          await localAudioRef.current.start();
          audioTrackStartedRef.current = true;
          setActiveMicrophone(deviceId);
          setIsStartedAudio(true);
          setIsMuted(false);
        } catch (error) {
          console.error('Error starting new audio track:', error);
          audioTrackStartedRef.current = false;
          setIsStartedAudio(false);
        }
      }
    },
    [activeMicrophone, localAudioRef, setActiveMicrophone, safeStopAudio]
  );

  const onTestSpeakerClick = useCallback(() => {
    if (!localAudioRef.current || typeof window === 'undefined') return;

    if (microphoneTesterRef.current) {
      microphoneTesterRef.current.destroy();
      microphoneTesterRef.current = null;
      setIsRecordingVoice(false);
      setIsPlayingRecording(false);
    }

    if (isPlayingAudio) {
      if (speakerTesterRef.current) {
        speakerTesterRef.current.stop();
        speakerTesterRef.current = null;
      }
      setIsPlayingAudio(false);
      setOutputLevel(0);
    } else {
      try {
        const tester = localAudioRef.current.testSpeaker({
          speakerId: activeSpeaker,
          onAnalyseFrequency: (value: number) => {
            setOutputLevel(Math.min(100, value));
          },
        });
        speakerTesterRef.current = tester || null;
        setIsPlayingAudio(true);
      } catch (error) {
        console.error('Error testing speaker:', error);
      }
    }
  }, [
    isPlayingAudio,
    activeSpeaker,
    localAudioRef,
    speakerTesterRef,
    microphoneTesterRef,
  ]);

  const onTestMicrophoneClick = useCallback(() => {
    if (!localAudioRef.current || typeof window === 'undefined') return;

    if (speakerTesterRef.current) {
      speakerTesterRef.current.destroy();
      speakerTesterRef.current = null;
      setIsPlayingAudio(false);
      setOutputLevel(0);
    }

    if (!isPlayingRecording && !isRecordingVoice) {
      if (microphoneTesterRef.current) {
        try {
          microphoneTesterRef.current.stop();
          microphoneTesterRef.current.destroy();
        } catch {
          // Ignore errors during cleanup
        }
        microphoneTesterRef.current = null;
      }
      setInputLevel(0);

      try {
        const tester = localAudioRef.current.testMicrophone({
          microphoneId: activeMicrophone,
          speakerId: activeSpeaker,
          recordAndPlay: true,
          onAnalyseFrequency: (value: number) => {
            if (microphoneTesterRef.current) {
              setInputLevel(Math.min(100, value));
            }
          },
          onStartRecording: () => {
            setIsRecordingVoice(true);
          },
          onStartPlayRecording: () => {
            setIsRecordingVoice(false);
            setIsPlayingRecording(true);
          },
          onStopPlayRecording: () => {
            setIsPlayingRecording(false);
            setInputLevel(0);
            if (microphoneTesterRef.current) {
              try {
                microphoneTesterRef.current.destroy();
              } catch {}
              microphoneTesterRef.current = null;
            }
          },
        });
        microphoneTesterRef.current = tester || null;
      } catch (error) {
        console.error('Error testing microphone:', error);
        setInputLevel(0);
      }
    } else if (isRecordingVoice) {
      if (microphoneTesterRef.current) {
        try {
          microphoneTesterRef.current.stopRecording();
        } catch (error: unknown) {
          console.error('Error stopping recording:', error);
        }
        setIsRecordingVoice(false);
        setInputLevel(0);
      }
    } else if (isPlayingRecording) {
      if (microphoneTesterRef.current) {
        try {
          microphoneTesterRef.current.stop();
          microphoneTesterRef.current.destroy();
        } catch (error: unknown) {
          console.error('Error stopping playback:', error);
        }
        microphoneTesterRef.current = null;
        setIsPlayingRecording(false);
        setInputLevel(0);
      }
    }
  }, [
    isPlayingRecording,
    isRecordingVoice,
    activeMicrophone,
    activeSpeaker,
    localAudioRef,
    speakerTesterRef,
    microphoneTesterRef,
  ]);

  const onSpeakerSelect = useCallback(
    (deviceId: string) => {
      switchSpeaker(deviceId);
      setActiveSpeaker(deviceId);
      if (isPlayingAudio) {
        speakerTesterRef.current?.stop();
        setIsPlayingAudio(false);
        setOutputLevel(0);
      }
    },
    [switchSpeaker, setActiveSpeaker, isPlayingAudio, speakerTesterRef]
  );

  const onMicTestSelect = useCallback(
    (deviceId: string) => {
      switchMicrophone(deviceId);
      setActiveMicrophone(deviceId);
      if (isRecordingVoice || isPlayingRecording) {
        if (microphoneTesterRef.current) {
          try {
            microphoneTesterRef.current.stop();
            microphoneTesterRef.current.destroy();
          } catch {}
          microphoneTesterRef.current = null;
        }
        setIsRecordingVoice(false);
        setIsPlayingRecording(false);
        setInputLevel(0);
      }
    },
    [
      switchMicrophone,
      setActiveMicrophone,
      isRecordingVoice,
      isPlayingRecording,
      microphoneTesterRef,
    ]
  );

  const handleJoinCall = useCallback(async () => {
    setPreviewSettings({
      isMuted,
      activeCamera,
      activeMicrophone,
      activeSpeaker,
      isVideoOn: isStartedVideo,
    });

    const success = await joinSession();

    if (success) {
      if (localAudioRef.current && audioTrackStartedRef.current) {
        await safeStopAudio(localAudioRef.current);
      }
      if (localVideoRef.current && videoTrackStartedRef.current) {
        await safeStopVideo(localVideoRef.current);
      }
    }
  }, [
    isMuted,
    isStartedVideo,
    activeCamera,
    activeMicrophone,
    activeSpeaker,
    setPreviewSettings,
    joinSession,
    safeStopAudio,
    safeStopVideo,
    localAudioRef,
    localVideoRef,
  ]);

  const handleCancel = useCallback(() => {
    closePreview();
  }, [closePreview]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center py-4 px-4 lg:py-8 relative">
      <div className="w-full lg:w-[1057px] space-y-6 lg:space-y-[50px]">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <Image
            src="/images/carelio-logo.png"
            alt="Carelio"
            width={180}
            height={55}
            className="object-contain"
          />
          <h1 className="text-[24px] font-bold text-foreground">
            Online Consultation
          </h1>
          <p className="text-muted-foreground text-sm">
            Test your camera, microphone, and speakers before joining
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 w-full justify-center gap-4">
          {/* Video Preview */}
          <div className="overflow-hidden relative w-full">
            <VideoPreview
              isStartedVideo={isStartedVideo}
              isInVBMode={isInVBMode}
              videoRef={videoRef}
              canvasRef={canvasRef}
            />

            {/* Control Bar */}
            <ControlBar
              isStartedAudio={isStartedAudio}
              isMuted={isMuted}
              isStartedVideo={isStartedVideo}
              micList={micList}
              cameraList={cameraList}
              activeMicrophone={activeMicrophone}
              activeCamera={activeCamera}
              onMicrophoneClick={onMicrophoneClick}
              onMicrophoneSelect={onMicrophoneSelect}
              onCameraClick={onCameraClick}
              onCameraSelect={async (deviceId: string) => {
                if (
                  isStartedVideo &&
                  videoTrackStartedRef.current &&
                  localVideoRef.current
                ) {
                  try {
                    await switchCamera(deviceId);
                  } catch (error) {
                    console.error('Error switching camera:', error);
                  }
                }
              }}
            />
          </div>

          {/* Audio Testing Section */}
          <div className="grid w-full gap-4">
            <SpeakerTest
              speakerList={speakerList}
              activeSpeaker={activeSpeaker}
              outputLevel={outputLevel}
              isPlaying={isPlayingAudio}
              onSpeakerSelect={onSpeakerSelect}
              onTestClick={onTestSpeakerClick}
            />

            <MicrophoneTest
              micList={micList}
              activeMicrophone={activeMicrophone}
              inputLevel={inputLevel}
              isRecording={isRecordingVoice}
              isPlayingRecording={isPlayingRecording}
              onMicrophoneSelect={onMicTestSelect}
              onTestClick={onTestMicrophoneClick}
            />
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isJoining}
                className="h-[50px] w-full sm:w-[154px] cursor-pointer border-black text-sm font-normal rounded-full"
              >
                Cancel
              </Button>
              <Button
                variant={'brand'}
                onClick={handleJoinCall}
                disabled={isJoining}
                className="h-[50px] w-full sm:w-[154px] text-sm font-normal rounded-full"
              >
                {isJoining ? (
                  <>
                    <Spinner />
                    Joining...
                  </>
                ) : (
                  'Join Call'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
