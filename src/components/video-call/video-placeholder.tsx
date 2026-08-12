import LargeVideoSvg from '@/assets/icons/large-video-svg';
import VideoSvg from '@/assets/icons/video-svg';

interface VideoPlaceholderProps {
  size?: 'small' | 'large';
  label?: string;
}

const VideoPlaceholder = ({ size = 'large', label }: VideoPlaceholderProps) => {
  const containerSize = size === 'large' ? 'size-[150px]' : 'size-[65px]';
  const iconSize = size === 'large' ? 'size-[65px]' : 'size-[28px]';

  return (
    <div
      className={`bg-(--bg-video-medium) rounded-full ${containerSize} flex items-center justify-center`}
    >
      <div className={iconSize}>
        {size === 'large' ? <LargeVideoSvg /> : <VideoSvg />}
      </div>
      {label && (
        <p className="text-(--bg-video-gray) text-[14px] font-normal leading-[1.2] mt-[5px] text-center">
          {label}
        </p>
      )}
    </div>
  );
};

export default VideoPlaceholder;
