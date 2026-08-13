import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AudioLevelMeter from '../audio-level-meter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MicrophoneSvg from '@/assets/icons/microphone-svg';
import type { MediaDevice } from './types';
import { cn } from '@/lib/utils';

interface MicrophoneTestProps {
  micList: MediaDevice[];
  activeMicrophone: string;
  inputLevel: number;
  isRecording: boolean;
  isPlayingRecording: boolean;
  onMicrophoneSelect: (deviceId: string) => void;
  onTestClick: () => void;
}

export default function MicrophoneTest({
  micList,
  activeMicrophone,
  inputLevel,
  isRecording,
  isPlayingRecording,
  onMicrophoneSelect,
  onTestClick,
}: MicrophoneTestProps) {
  const getButtonText = () => {
    if (isRecording) return 'Recording...';
    if (isPlayingRecording) return 'Playing...';
    return 'Test Microphone';
  };

  const getButtonVariant = () => {
    if (isRecording) return 'destructive';
    if (isPlayingRecording) return 'secondary';
    return 'default';
  };

  return (
    <Card className="shadow-none rounded-[30px] p-5 bg-(--bg-lighter-gray) border-(--border-stroke)">
      <CardHeader className="">
        <CardTitle className="flex items-center gap-2 text-sm">
          <MicrophoneSvg className="w-5 h-5 text-primary" />
          Microphone Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant={getButtonVariant()}
            onClick={onTestClick}
            className={cn(
              'shrink-0 min-w-[140px] h-[38px] w-full sm:w-auto rounded-[12px] text-[12px] font-normal',
              isRecording ? 'text-white' : '',
              isPlayingRecording ? 'text-white bg-green-500' : '',
              isRecording && 'animate-pulse'
            )}
          >
            {getButtonText()}
          </Button>

          <Select value={activeMicrophone} onValueChange={onMicrophoneSelect}>
            <SelectTrigger className="flex-1 w-full h-[38px] rounded-[12px] text-[12px] font-normal border-(--border-stroke) border">
              <SelectValue placeholder="Select microphone" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {micList?.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || 'Unknown Microphone'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-(--text-label) text-xs">Input Level</span>
            <span className="font-normal text-(--text-label) text-xs">
              {Math.round(inputLevel)}%
            </span>
          </div>
          <AudioLevelMeter level={inputLevel} />
        </div>

        {isRecording && (
          <p className="text-xs text-muted-foreground text-center">
            Speak now... Recording will play back automatically
          </p>
        )}
      </CardContent>
    </Card>
  );
}
