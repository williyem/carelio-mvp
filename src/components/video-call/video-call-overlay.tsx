/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { createPortal } from 'react-dom';
import { useVideoCallStore } from '@/stores/video-call-store';
import DraggablePip from './draggable-pip';
import VideoCallPreview from './preview/video-call-preview';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { getFullNameFromUser } from '@/lib/easy';
import { toast } from 'sonner';
import useGetDoctorConsultationToken from '@/integration/doctor/mutations';
import PostConsultationSummary from './post-consulation-summary';
import { useCompleteConsultation } from '@/integration/appointments/mutations';

const FullscreenCall = dynamic<{ leaveSession: () => Promise<void> }>(
  () => import('./fullscreen-call'),
  {
    ssr: false,
  }
);

export default function VideoCallOverlayComponent() {
  const {
    client,
    setClient,
    isActive,
    isMinimized,
    isInPreview,
    startCallFromPreview,
    selectedAppointment,
    setIsMuted,
    setIsVideoPaused,
    setIsJoining,
    setPostConsultationAppointmentId,
    endCall,
  } = useVideoCallStore();
  const { getDoctorConsultationTokenMutation } =
    useGetDoctorConsultationToken();
  const { mutate: completeConsultation } = useCompleteConsultation();

  useEffect(() => {
    (async () => {
      const { default: ZoomVideo } = await import('@zoom/videosdk');
      const zoomClient = ZoomVideo.createClient();
      setClient(zoomClient);
    })();
  }, [setClient]);

  const joinSession = async (): Promise<boolean> => {
    if (!client) return false;
    const userName = getFullNameFromUser(
      selectedAppointment?.doctor as unknown as {
        firstName: string;
        lastName: string;
      }
    );
    setIsJoining(true);

    return new Promise<boolean>((resolve) => {
      getDoctorConsultationTokenMutation.mutate(
        selectedAppointment?.id as string,
        {
          onSuccess: async (data) => {
            if (!navigator.mediaDevices) {
              toast.error(
                'Video calls require a secure connection (HTTPS) or are not supported on this device.'
              );
              setIsJoining(false);
              resolve(false);

              return;
            }

            try {
              await client.init('en-US', 'Global', { patchJsMedia: true });
            } catch (e) {
              toast.error('Failed to initialize video client');
              setIsJoining(false);
              resolve(false);

              return;
            }

            await client
              .join(data.code, data.token, userName)
              .then(async () => {
                const mediaStream = client.getMediaStream();
                await mediaStream.startAudio();
                const { previewSettings } = useVideoCallStore.getState();

                if (previewSettings) {
                  if (previewSettings.activeMicrophone) {
                    try {
                      await mediaStream.switchMicrophone(
                        previewSettings.activeMicrophone
                      );
                    } catch (e) {
                      console.error('Failed to switch mic', e);
                    }
                  }
                  if (previewSettings.activeSpeaker) {
                    try {
                      await mediaStream.switchSpeaker(
                        previewSettings.activeSpeaker
                      );
                    } catch (e) {
                      console.error('Failed to switch speaker', e);
                    }
                  }

                  if (previewSettings.isMuted) {
                    await mediaStream.muteAudio();
                    setIsMuted(true);
                  } else {
                    await mediaStream.unmuteAudio();
                    setIsMuted(false);
                  }

                  if (previewSettings.isVideoOn) {
                    if (previewSettings.activeCamera) {
                      try {
                        await mediaStream.switchCamera(
                          previewSettings.activeCamera
                        );
                      } catch (e) {
                        console.error('Failed to switch camera', e);
                      }
                    }
                    await mediaStream.startVideo();
                    setIsVideoPaused(false);
                    resolve(true);
                  } else {
                    // If video was off in preview, keep it off
                    setIsVideoPaused(true);
                    resolve(true);
                  }
                } else {
                  // Fallback default
                  setIsMuted(false);
                  await mediaStream.startVideo();
                  setIsVideoPaused(false);
                  resolve(true);
                }
                setIsJoining(false);
                startCallFromPreview();
              })
              .catch((e) => {
                toast.error(e?.message || 'Failed to join call');
                setIsJoining(false);
                resolve(false);
              })
              .finally(() => {
                setIsJoining(false);
              });
          },
          onError: (error) => {
            toast.error(error?.message || 'Failed to join call');
            setIsJoining(false);
            resolve(false);
          },
        }
      );
    });
  };

  const leaveSession = async () => {
    if (!client) return;

    try {
      const mediaStream = client.getMediaStream();
      if (
        typeof mediaStream.isCapturingVideo === 'function' &&
        mediaStream.isCapturingVideo()
      ) {
        await mediaStream?.stopVideo?.().catch(() => {});
      }
      await mediaStream?.stopAudio?.().catch(() => {});
    } catch (e) {
      console.log('Error stopping media tracks:', e);
    }

    try {
      await client.leave(true).catch((e) => console.log('leave error', e));
    } catch (e) {
      console.log('Error destroying client:', e);
    }

    if (selectedAppointment?.id) {
      completeConsultation(selectedAppointment.id);
    }

    setPostConsultationAppointmentId(selectedAppointment?.id || '');
    endCall();
  };

  if (!isActive || typeof window === 'undefined') {
    return null;
  }

  if (isInPreview) {
    return <VideoCallPreview joinSession={joinSession} />;
  }

  const content = isMinimized ? (
    <DraggablePip handleEndCall={leaveSession} />
  ) : (
    <FullscreenCall leaveSession={leaveSession} />
  );

  return createPortal(
    <>
      {content}
      <PostConsultationSummary />
    </>,
    document.body
  );
}
