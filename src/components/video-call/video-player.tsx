'use client';

import { useRef, useEffect, memo } from 'react';
import type { ZoomClientType } from '@/stores/video-call-store';
import MuteIndicator from './mute-indicator';

interface VideoPlayerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  participant: any;
  client: ZoomClientType;
  className?: string;
  muteIndicatorPosition?: 'top-left' | 'top-right';
  scale?: number;
}

const VideoPlayerComponent = ({
  participant,
  client,
  className,
  muteIndicatorPosition = 'top-right',
  scale = 1.01,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const isMuted = participant?.muted === true;

  useEffect(() => {
    if (!client || !participant) return;

    let isMounted = true;
    const { userId } = participant;

    const render = async () => {
      try {
        const { VideoQuality } = await import('@zoom/videosdk');

        if (!participant.bVideoOn) return;

        if (!isMounted) return;

        const mediaStream = client.getMediaStream();
        const videoElement = (await mediaStream.attachVideo(
          userId,
          VideoQuality.Video_720P
        )) as HTMLElement;

        if (isMounted && videoRef.current && videoElement) {
          const styleStr = `
              width: 100% !important;
              height: 100% !important;
              object-fit: cover !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              inset: 0 !important;
              display: block !important;
              border-radius: 30px !important;
              transform: scale(${scale}) !important;
           `;
          videoElement.style.cssText = styleStr;

          const isContainer = videoElement.tagName === 'VIDEO-PLAYER-CONTAINER';
          let elementToAppend = videoElement;

          if (!isContainer) {
            const container = document.createElement(
              'video-player-container'
            ) as HTMLElement;
            container.style.cssText = `
                width: 100% !important;
                height: 100% !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                display: block !important;
                overflow: hidden !important;
                border-radius: 30px !important;
                transform: scale(${scale}) !important;
            `;
            container.appendChild(videoElement);
            elementToAppend = container;
          } else {
            videoElement.style.cssText += `overflow: hidden !important; border-radius: 30px !important; transform: scale(${scale}) !important;`;
          }

          if (videoRef.current) {
            videoRef.current.innerHTML = '';
            videoRef.current.appendChild(elementToAppend);
          }
        }
      } catch (error) {
        console.error('Failed to render video for user', userId, error);
      }
    };

    const onVideoStateChange = async (payload: {
      action: 'Start' | 'Stop';
      userId: number;
    }) => {
      if (payload.userId !== userId) return;

      if (payload.action === 'Start') {
        await render();
      } else if (payload.action === 'Stop') {
        const mediaStream = client.getMediaStream();
        await mediaStream.detachVideo(userId);
        if (isMounted && videoRef.current) {
          while (videoRef.current.firstChild) {
            videoRef.current.removeChild(videoRef.current.firstChild);
          }
        }
      }
    };

    client.on('peer-video-state-change', onVideoStateChange);

    // Initial render check
    if (participant.bVideoOn) {
      render();
    }

    return () => {
      isMounted = false;
      client.off('peer-video-state-change', onVideoStateChange);

      const cleanup = async () => {
        try {
          const mediaStream = client.getMediaStream();
          if (participant.bVideoOn) {
            await mediaStream.detachVideo(userId).catch(() => {});
          }
        } catch {
          // Ignore cleanup errors
          // console.error('Failed to detach video for user', userId, error);
        }
      };
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, participant?.userId, participant?.bVideoOn, scale]);

  // MutationObserver to enforce styles if Zoom SDK changes them
  useEffect(() => {
    if (!participant.bVideoOn || !videoRef.current) return;

    const enforceStyle = () => {
      const els = videoRef.current?.querySelectorAll(
        'video-player-container, video, canvas'
      );
      els?.forEach((el) => {
        const hEl = el as HTMLElement;
        hEl.style.setProperty('object-fit', 'cover', 'important');
        hEl.style.setProperty('width', '100%', 'important');
        hEl.style.setProperty('height', '100%', 'important');
        hEl.style.setProperty('position', 'absolute', 'important');
        hEl.style.setProperty('inset', '0', 'important');
        hEl.style.setProperty('border-radius', '30px', 'important');
        hEl.style.setProperty('transform', `scale(${scale})`, 'important');
      });
    };

    const observer = new MutationObserver(() => enforceStyle());
    observer.observe(videoRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style'],
    });

    // also run once
    enforceStyle();

    return () => observer.disconnect();
  }, [participant.bVideoOn, scale]);

  // Ensure we clean up if switching modes
  useEffect(() => {
    if (!participant.bVideoOn && videoRef.current) {
      // Force cleanup if we switched to avatar mode but ref still exists (should rely on React conditional rendering but safety check)
    }
  }, [participant.bVideoOn]);

  const getInitials = (name: string) => {
    return (
      name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'P'
    );
  };

  const getColor = (name: string) => {
    const colors = [
      '#FF5733',
      '#33FF57',
      '#3357FF',
      '#F033FF',
      '#FF33A8',
      '#33FFF5',
      '#FF8C33',
      '#8C33FF',
      '#FF3333',
      '#33FF8C',
    ];
    let hash = 0;
    const str = name || 'default';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const displayName = participant.displayName || 'Participant';

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: participant.bVideoOn ? '#000000' : '#1F2B3C',
      }}
    >
      {participant.bVideoOn ? (
        <div ref={videoRef} style={{ width: '100%', height: '100%' }} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            style={{
              backgroundColor: getColor(displayName),
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '48px',
              fontWeight: 'bold',
            }}
          >
            {getInitials(displayName)}
          </div>
        </div>
      )}
      {isMuted && (
        <MuteIndicator
          className={
            muteIndicatorPosition === 'top-left'
              ? 'top-2 left-2 right-auto'
              : undefined
          }
        />
      )}
    </div>
  );
};

export const VideoPlayer = memo(
  VideoPlayerComponent,
  (prevProps: VideoPlayerProps, nextProps: VideoPlayerProps) => {
    return (
      prevProps.participant?.userId === nextProps.participant?.userId &&
      prevProps.participant?.bVideoOn === nextProps.participant?.bVideoOn &&
      prevProps.participant?.muted === nextProps.participant?.muted &&
      prevProps.client === nextProps.client &&
      prevProps.className === nextProps.className &&
      prevProps.muteIndicatorPosition === nextProps.muteIndicatorPosition &&
      prevProps.scale === nextProps.scale
    );
  }
);
