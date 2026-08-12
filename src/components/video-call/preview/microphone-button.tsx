import { ChevronDown, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { MediaDevice } from './types';
import { cn } from '@/lib/utils';
import MuteSvg from '@/assets/icons/mute-svg';
import UnmuteSvg from '@/assets/icons/unmute-svg';

interface MicrophoneButtonProps {
  isStartedAudio: boolean;
  isMuted: boolean;
  micList: MediaDevice[];
  activeMicrophone: string;
  onMicrophoneClick: () => void;
  onMicrophoneSelect: (deviceId: string) => void;
}

export default function MicrophoneButton({
  isStartedAudio,
  isMuted,
  micList,
  activeMicrophone,
  onMicrophoneClick,
  onMicrophoneSelect,
}: MicrophoneButtonProps) {
  const Icon = !isStartedAudio || isMuted ? <MuteSvg /> : <UnmuteSvg />;
  const isActive = isStartedAudio && !isMuted;

  return (
    <div className="flex items-center">
      <Button
        variant="secondary"
        size="lg"
        className={cn(
          'rounded-r-none relative cursor-pointer gap-2 h-[60px] rounded-[1000px] px-2.5  pr-7 justify-start border-[#E0E0E0] bg-white border transition-all'
        )}
        onClick={onMicrophoneClick}
      >
        <div className="bg-primary rounded-full   flex items-center justify-center size-10">
          {Icon}
        </div>
        <span className="hidden sm:inline">
          {!isStartedAudio ? 'Start Audio' : isMuted ? 'Unmute' : 'Mute'}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span
              className={cn(
                'rounded-l-none cursor-pointer flex items-center justify-center border-l absolute right-0 hover:bg-transparent  h-[60px] border-l-background/20 px-2',
                isActive && ''
              )}
            >
              <ChevronDown className="w-4 h-4" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 bg-popover">
            <DropdownMenuLabel>Select Microphone</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {micList?.map((device) => (
              <DropdownMenuItem
                key={device.deviceId}
                onClick={() => onMicrophoneSelect(device.deviceId)}
                className={cn(
                  'cursor-pointer',
                  device.deviceId === activeMicrophone && 'bg-accent'
                )}
              >
                <Mic className="w-4 h-4 mr-2" />
                <span className="truncate">
                  {device.label || 'Unknown Microphone'}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Button>
    </div>
  );
}
