import { Video, VideoOff, ChevronDown } from 'lucide-react';
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

interface CameraButtonProps {
  isStartedVideo: boolean;
  cameraList: MediaDevice[];
  activeCamera: string;
  onCameraClick: () => void;
  onCameraSelect: (deviceId: string) => void;
}

export default function CameraButton({
  isStartedVideo,
  cameraList,
  activeCamera,
  onCameraClick,
  onCameraSelect,
}: CameraButtonProps) {
  const Icon = isStartedVideo ? Video : VideoOff;

  return (
    <div className="flex items-center">
      <Button
        variant="secondary"
        size="lg"
        className={cn(
          'rounded-r-none relative cursor-pointer gap-2 h-[60px] rounded-[1000px] px-2.5  pr-7 justify-start border-(--border-stroke) bg-(--bg-white) border transition-all'
        )}
        onClick={onCameraClick}
      >
        <div className="bg-primary rounded-full   flex items-center justify-center size-10">
          <Icon className="w-6 h-6 text-white" size={24} />
        </div>
        <span className="hidden sm:inline">
          {isStartedVideo ? 'Stop Video' : 'Start Video'}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span
              className={cn(
                'rounded-l-none cursor-pointer flex items-center justify-center border-l absolute right-0 hover:bg-transparent  h-[60px] border-l-background/20 px-2'
              )}
            >
              <ChevronDown className="w-4 h-4" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 bg-popover">
            <DropdownMenuLabel>Select Camera</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {cameraList.map((device) => (
              <DropdownMenuItem
                key={device.deviceId}
                onClick={() => onCameraSelect(device.deviceId)}
                className={cn(
                  'cursor-pointer',
                  device.deviceId === activeCamera && 'bg-accent'
                )}
              >
                <Video className="w-4 h-4 mr-2" />
                <span className="truncate">
                  {device.label || 'Unknown Camera'}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Button>
    </div>
  );
}
