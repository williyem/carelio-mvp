'use client';

import { createPortal } from 'react-dom';
import { useVideoCallStore } from '@/stores/video-call-store';
import DraggablePip from './draggable-pip';
import VideoCallPreview from './preview/video-call-preview';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import useGetDoctorConsultationToken from '@/integration/doctor/mutations';
import {
  useCompleteConsultation,
  useStartConsultation,
} from '@/integration/appointments/mutations';
import { Room, RoomEvent } from 'livekit-client';
import {
  getCallJoinError,
  isClinicianCallRole,
  readPortalIdentity,
} from '@/lib/call-join';
import { useCallParticipantRole } from '@/hooks/page-hooks/video-call/use-call-participant-role';

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
  const { mutateAsync: startConsultation } = useStartConsultation();
  const { role } = useCallParticipantRole();

  const joinSession = async (): Promise<boolean> => {
    const identity = readPortalIdentity();
    const joinError = getCallJoinError(selectedAppointment, identity);
    if (joinError) {
      toast.error(joinError);
      return false;
    }

    if (!selectedAppointment?.id) {
      toast.error('No appointment selected for this call');
      return false;
    }

    const audioContext = new AudioContext();
    await audioContext.resume().catch(() => {});

    setIsJoining(true);

    return new Promise<boolean>((resolve) => {
      getDoctorConsultationTokenMutation.mutate(selectedAppointment.id, {
        onSuccess: async (data) => {
          if (!navigator.mediaDevices) {
            toast.error(
              'Video calls require a secure connection (HTTPS) or are not supported on this device.'
            );
            void audioContext.close();
            setIsJoining(false);
            resolve(false);
            return;
          }

          if (!data.url) {
            toast.error('LiveKit URL missing from consultation token');
            void audioContext.close();
            setIsJoining(false);
            resolve(false);
            return;
          }

          const room = new Room({
            adaptiveStream: true,
            dynacast: true,
            webAudioMix: { audioContext },
          });
          setClient(room);

          try {
            await room.connect(data.url, data.token);
            await room.startAudio().catch(() => {});
            room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
              if (!room.canPlaybackAudio) {
                void room.startAudio();
              }
            });
            const { previewSettings } = useVideoCallStore.getState();

            await room.localParticipant.setMicrophoneEnabled(
              !(previewSettings?.isMuted ?? false),
              previewSettings?.activeMicrophone
                ? { deviceId: previewSettings.activeMicrophone }
                : undefined
            );
            setIsMuted(previewSettings?.isMuted ?? false);

            if (previewSettings?.activeSpeaker) {
              await room.switchActiveDevice(
                'audiooutput',
                previewSettings.activeSpeaker
              );
            }

            if (previewSettings?.isVideoOn) {
              await room.localParticipant.setCameraEnabled(
                true,
                previewSettings.activeCamera
                  ? { deviceId: previewSettings.activeCamera }
                  : undefined
              );
              setIsVideoPaused(false);
            } else {
              await room.localParticipant.setCameraEnabled(false);
              setIsVideoPaused(true);
            }

            setIsJoining(false);
            try {
              await startConsultation(selectedAppointment.id);
            } catch (startError) {
              console.error(
                'Failed to mark appointment in progress',
                startError
              );
              toast.error(
                'Joined the call, but appointment status did not update'
              );
            }
            startCallFromPreview();
            resolve(true);
          } catch (e) {
            await room.disconnect().catch(() => {});
            void audioContext.close().catch(() => {});
            setClient(null);
            toast.error(e instanceof Error ? e.message : 'Failed to join call');
            setIsJoining(false);
            resolve(false);
          }
        },
        onError: (error) => {
          void audioContext.close().catch(() => {});
          toast.error(error?.message || 'Failed to join call');
          setIsJoining(false);
          resolve(false);
        },
      });
    });
  };

  const leaveSession = async () => {
    try {
      await client?.disconnect();
    } catch (e) {
      console.log('Error leaving room:', e);
    }
    setClient(null);

    if (isClinicianCallRole(role) && selectedAppointment?.id) {
      completeConsultation(selectedAppointment.id);
      setPostConsultationAppointmentId(selectedAppointment.id);
    }

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

  // PostConsultationSummary is mounted in providers.tsx; it must outlive this
  // overlay, which unmounts as soon as endCall() clears isActive.
  return createPortal(content, document.body);
}
