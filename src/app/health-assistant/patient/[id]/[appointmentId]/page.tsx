'use client';

import { use } from 'react';
import { Calendar } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { ROUTES } from '@/lib/routes';
import BackButton from '@/components/dashboard/back-button';
import PostConsultationDetails from '@/components/video-call/post-consultation-details';
import { useGetConsultationNoteByAppointment } from '@/integration/appointments/queries/useGetConsultationNoteByAppointment';
import { useGetAppointmentById } from '@/integration/appointments';
import { formatAppointmentDate } from '@/lib/easy';
import { Spinner } from '@/components/ui/spinner';

export default function HealthAssistantAppointmentSummaryPage({
  params,
}: {
  params: Promise<{ id: string; appointmentId: string }>;
}) {
  const { id, appointmentId } = use(params);
  const router = useRouter();
  const { data: note, isLoading: isLoadingNote } =
    useGetConsultationNoteByAppointment(appointmentId);
  const { data: appointment, isLoading: isLoadingAppointment } =
    useGetAppointmentById(appointmentId);

  const dateLabel =
    formatAppointmentDate(appointment?.startTime) ||
    formatAppointmentDate(note?.createdAt) ||
    'Visit summary';

  return (
    <div className="flex flex-col gap-[15px] items-start w-[900px] max-w-full mx-auto">
      <BackButton
        onClick={() => router.push(ROUTES.HEALTH_ASSISTANT.PATIENT.DETAILS(id))}
      />
      <div className="flex flex-col gap-2 w-full">
        <h1 className="font-bold leading-[1.2] text-(--text-primary) text-[20px] sm:text-[24px]">
          Visit summary
        </h1>
        <div className="flex gap-[5px] items-center">
          <Calendar className="w-[18px] h-[18px] text-(--text-primary)" />
          <p className="font-normal leading-[1.2] text-(--text-primary) text-[14px]">
            {isLoadingAppointment ? 'Loading…' : dateLabel}
          </p>
        </div>
      </div>
      {isLoadingNote ? (
        <div className="flex items-center justify-center py-16 w-full">
          <Spinner />
        </div>
      ) : (
        <PostConsultationDetails
          note={note ?? null}
          appointmentId={appointmentId}
          variant="shared"
        />
      )}
    </div>
  );
}
