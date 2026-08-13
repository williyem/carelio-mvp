'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useZoomDevices } from '@/hooks/page-hooks/video-call/useZoomDevices';
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
    isLoading,
  } = useZoomDevices();

  const { setPreviewSettings, closePreview, isJoining } = useVideoCallStore();

  const [isStartedAudio, setIsStartedAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isStartedVideo, setIsStartedVideo] = useState(false);
  const [outputLevel, setOutputLevel] = useState(0);
  const [inputLevel, setInputLevel] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const speakerOscRef = useRef<OscillatorNode | null>(null);
  const meterRafRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const playbackRef = useRef<HTMLAudioElement | null>(null);

  const stopMeter = useCallback(() => {
    if (meterRafRef.current) {
      cancelAnimationFrame(meterRafRef.current);
      meterRafRef.current = null;
    }
  }, []);

  const startMeter = useCallback(
    (stream: MediaStream, setter: (n: number) => void) => {
      stopMeter();
      const ctx = audioContextRef.current ?? new AudioContext();
      audioContextRef.current = ctx;
      void ctx.resume();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setter(Math.min(100, Math.round((avg / 255) * 100)));
        meterRafRef.current = requestAnimationFrame(tick);
      };
      tick();
    },
    [stopMeter]
  );

  const stopVideoPreview = useCallback(() => {
    videoStreamRef.current?.getTracks().forEach((t) => t.stop());
    videoStreamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const stopAudioPreview = useCallback(() => {
    audioStreamRef.current?.getTracks().forEach((t) => t.stop());
    audioStreamRef.current = null;
    stopMeter();
    setInputLevel(0);
  }, [stopMeter]);

  useEffect(() => {
    return () => {
      stopVideoPreview();
      stopAudioPreview();
      speakerOscRef.current?.stop();
      audioContextRef.current?.close().catch(() => {});
      playbackRef.current?.pause();
    };
  }, [stopAudioPreview, stopVideoPreview]);

  const onCameraClick = useCallback(async () => {
    if (isStartedVideo) {
      stopVideoPreview();
      setIsStartedVideo(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: activeCamera ? { deviceId: { exact: activeCamera } } : true,
        audio: false,
      });
      videoStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setIsStartedVideo(true);
    } catch (error) {
      console.error('Error starting video:', error);
      setIsStartedVideo(false);
    }
  }, [activeCamera, isStartedVideo, stopVideoPreview]);

  const onMicrophoneClick = useCallback(async () => {
    if (isStartedAudio) {
      if (isMuted) {
        audioStreamRef.current
          ?.getAudioTracks()
          .forEach((t) => (t.enabled = true));
        if (audioStreamRef.current) {
          startMeter(audioStreamRef.current, setInputLevel);
        }
        setIsMuted(false);
      } else {
        audioStreamRef.current
          ?.getAudioTracks()
          .forEach((t) => (t.enabled = false));
        stopMeter();
        setInputLevel(0);
        setIsMuted(true);
      }
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: activeMicrophone
          ? { deviceId: { exact: activeMicrophone } }
          : true,
        video: false,
      });
      audioStreamRef.current = stream;
      startMeter(stream, setInputLevel);
      setIsStartedAudio(true);
      setIsMuted(false);
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  }, [activeMicrophone, isMuted, isStartedAudio, startMeter, stopMeter]);

  const onMicrophoneSelect = useCallback(
    async (deviceId: string) => {
      setActiveMicrophone(deviceId);
      if (!isStartedAudio) return;
      stopAudioPreview();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
        video: false,
      });
      audioStreamRef.current = stream;
      startMeter(stream, setInputLevel);
      setIsStartedAudio(true);
      setIsMuted(false);
    },
    [isStartedAudio, setActiveMicrophone, startMeter, stopAudioPreview]
  );

  const onTestSpeakerClick = useCallback(async () => {
    if (isPlayingAudio) {
      speakerOscRef.current?.stop();
      speakerOscRef.current = null;
      setIsPlayingAudio(false);
      setOutputLevel(0);
      return;
    }
    const ctx = audioContextRef.current ?? new AudioContext();
    audioContextRef.current = ctx;
    await ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 440;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    speakerOscRef.current = osc;
    setIsPlayingAudio(true);
    setOutputLevel(40);
    window.setTimeout(() => {
      osc.stop();
      speakerOscRef.current = null;
      setIsPlayingAudio(false);
      setOutputLevel(0);
    }, 1500);
  }, [isPlayingAudio]);

  const onTestMicrophoneClick = useCallback(async () => {
    if (isPlayingRecording) {
      playbackRef.current?.pause();
      setIsPlayingRecording(false);
      setInputLevel(0);
      return;
    }
    if (isRecordingVoice) {
      mediaRecorderRef.current?.stop();
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: activeMicrophone
        ? { deviceId: { exact: activeMicrophone } }
        : true,
      video: false,
    });
    audioStreamRef.current = stream;
    startMeter(stream, setInputLevel);
    recordedChunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      setIsRecordingVoice(false);
      stopMeter();
      const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      playbackRef.current = audio;
      setIsPlayingRecording(true);
      audio.onended = () => {
        setIsPlayingRecording(false);
        setInputLevel(0);
        URL.revokeObjectURL(url);
      };
      audio.play().catch(() => setIsPlayingRecording(false));
    };
    recorder.start();
    setIsRecordingVoice(true);
  }, [
    activeMicrophone,
    isPlayingRecording,
    isRecordingVoice,
    startMeter,
    stopMeter,
  ]);

  const onSpeakerSelect = useCallback(
    (deviceId: string) => {
      switchSpeaker(deviceId);
      setActiveSpeaker(deviceId);
    },
    [switchSpeaker, setActiveSpeaker]
  );

  const onMicTestSelect = useCallback(
    (deviceId: string) => {
      switchMicrophone(deviceId);
      setActiveMicrophone(deviceId);
    },
    [switchMicrophone, setActiveMicrophone]
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
      stopVideoPreview();
      stopAudioPreview();
    }
  }, [
    isMuted,
    isStartedVideo,
    activeCamera,
    activeMicrophone,
    activeSpeaker,
    setPreviewSettings,
    joinSession,
    stopAudioPreview,
    stopVideoPreview,
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
          <div className="overflow-hidden relative w-full">
            <VideoPreview
              isStartedVideo={isStartedVideo}
              isInVBMode={false}
              videoRef={videoRef}
              canvasRef={canvasRef}
            />

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
                await switchCamera(deviceId);
                if (isStartedVideo) {
                  stopVideoPreview();
                  setIsStartedVideo(false);
                  const stream = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: { exact: deviceId } },
                    audio: false,
                  });
                  videoStreamRef.current = stream;
                  if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play().catch(() => {});
                  }
                  setIsStartedVideo(true);
                }
              }}
            />
          </div>

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
