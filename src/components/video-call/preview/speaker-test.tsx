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
import SpeakerSvg from '@/assets/icons/speaker-svg';
import type { MediaDevice } from './types';
import { cn } from '@/lib/utils';

interface SpeakerTestProps {
  speakerList: MediaDevice[];
  activeSpeaker: string;
  outputLevel: number;
  isPlaying: boolean;
  onSpeakerSelect: (deviceId: string) => void;
  onTestClick: () => void;
}

export default function SpeakerTest({
  speakerList,
  activeSpeaker,
  outputLevel,
  isPlaying,
  onSpeakerSelect,
  onTestClick,
}: SpeakerTestProps) {
  return (
    <Card className=" shadow-none rounded-[30px] p-5 bg-(--bg-lighter-gray) border-(--border-stroke)">
      <CardHeader className="">
        <CardTitle className="flex items-center gap-2 text-sm">
          <SpeakerSvg className="w-5 h-5 text-primary" />
          Speaker Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant={isPlaying ? 'destructive' : 'default'}
            onClick={onTestClick}
            className={cn(
              'shrink-0 h-[38px] w-full sm:w-auto rounded-[12px] text-[12px] font-normal',
              isPlaying ? 'text-white' : 'text-white'
            )}
          >
            {isPlaying ? 'Stop' : 'Test Speaker'}
          </Button>

          <Select value={activeSpeaker} onValueChange={onSpeakerSelect}>
            <SelectTrigger className="flex-1 w-full h-[38px] rounded-[12px] text-[12px] font-normal border-(--border-stroke) border">
              <SelectValue placeholder="Select speaker" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {speakerList.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || 'Unknown Speaker'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-(--text-label) text-xs">Output Level</span>
            <span className="font-normal text-(--text-label) text-xs">
              {Math.round(outputLevel)}%
            </span>
          </div>
          <AudioLevelMeter level={outputLevel} />
        </div>
      </CardContent>
    </Card>
  );
}
