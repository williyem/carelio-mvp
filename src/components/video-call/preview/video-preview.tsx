import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import VideoSlashSvg from '@/assets/icons/video-slash-svg';

interface VideoPreviewProps {
  isStartedVideo: boolean;
  isInVBMode: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const VideoPreview = forwardRef<HTMLDivElement, VideoPreviewProps>(
  ({ isStartedVideo, isInVBMode, videoRef, canvasRef }, ref) => {
    return (
      <div
        ref={ref}
        className="relative aspect-video w-full h-full mx-auto overflow-hidden bg-(--bg-lighter-gray) border border-(--border-stroke) rounded-[30px]"
      >
        {/* Video element for regular preview */}
        <video
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300 rounded-[30px]',
            isInVBMode ? 'opacity-0' : 'opacity-100',
            !isStartedVideo && 'opacity-0'
          )}
          muted
          playsInline
          ref={videoRef}
        />

        {/* Canvas for virtual background mode */}
        <canvas
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300 rounded-[30px]',
            isInVBMode ? 'opacity-100' : 'opacity-0',
            !isStartedVideo && 'opacity-0'
          )}
          width="1280"
          height="720"
          ref={canvasRef}
        />

        {/* Placeholder when video is off */}
        {!isStartedVideo && (
          <div className="absolute inset-0 z-10 flex flex-col items-center max-sm:mt-3 sm:justify-center bg-(--bg-lighter-gray) rounded-[30px]">
            <div className=" size-[62px] sm:size-[112px] rounded-full bg-(--bg-white) flex items-center justify-center mb-3">
              <VideoSlashSvg size={30} />
            </div>
            <p className=" text-sm max-sm:text-xs font-normal">
              Your camera is off
            </p>
          </div>
        )}

        {/* Status indicator */}
        {isStartedVideo && (
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-full border border-border">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-foreground">Live</span>
          </div>
        )}
      </div>
    );
  }
);

VideoPreview.displayName = 'VideoPreview';

export default VideoPreview;
