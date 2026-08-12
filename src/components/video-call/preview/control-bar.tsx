import MicrophoneButton from './microphone-button';
import CameraButton from './camera-button';
import type { MediaDevice } from './types';

interface ControlBarProps {
  isStartedAudio: boolean;
  isMuted: boolean;
  isStartedVideo: boolean;
  micList: MediaDevice[];
  cameraList: MediaDevice[];
  activeMicrophone: string;
  activeCamera: string;
  onMicrophoneClick: () => void;
  onMicrophoneSelect: (deviceId: string) => void;
  onCameraClick: () => void;
  onCameraSelect: (deviceId: string) => void;
}

export default function ControlBar({
  isStartedAudio,
  isMuted,
  isStartedVideo,
  micList,
  cameraList,
  activeMicrophone,
  activeCamera,
  onMicrophoneClick,
  onMicrophoneSelect,
  onCameraClick,
  onCameraSelect,
}: ControlBarProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-3 flex-wrap p-4 ">
      <MicrophoneButton
        isStartedAudio={isStartedAudio}
        isMuted={isMuted}
        micList={micList}
        activeMicrophone={activeMicrophone}
        onMicrophoneClick={onMicrophoneClick}
        onMicrophoneSelect={onMicrophoneSelect}
      />

      <CameraButton
        isStartedVideo={isStartedVideo}
        cameraList={cameraList}
        activeCamera={activeCamera}
        onCameraClick={onCameraClick}
        onCameraSelect={onCameraSelect}
      />
    </div>
  );
}
