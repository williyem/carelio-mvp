'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { Calendar } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import BackButton from '@/components/dashboard/back-button';
import PostConsultationDetails from '@/components/video-call/post-consultation-details';
import { useGetConsultationNoteByAppointment } from '@/integration/appointments/queries/useGetConsultationNoteByAppointment';
import { useGetMyPatientAppointments } from '@/integration/appointments';
import { usePatientSession } from '@/integration/auth/patient';
import { formatAppointmentDate } from '@/lib/easy';
import { Spinner } from '@/components/ui/spinner';

const HealthRecordDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const recordId = params.recordId as string;

  const { data: session } = usePatientSession();
  const patientMongoId = session?.user?.id;
  const { appointments } = useGetMyPatientAppointments(
    patientMongoId,
    'COMPLETED',
    !!patientMongoId
  );
  const { data: note, isLoading } =
    useGetConsultationNoteByAppointment(recordId);

  const appointment = appointments.find((apt) => apt.id === recordId);
  const dateLabel =
    formatAppointmentDate(appointment?.startTime) ||
    formatAppointmentDate(note?.createdAt) ||
    'Visit summary';

  const handleBack = () => {
    router.push(ROUTES.PATIENT.HEALTH_RECORDS);
  };

  return (
    <div className="flex flex-col gap-[15px] items-start pt-4 sm:pt-10 px-4 sm:px-0 w-full max-w-[900px] mx-auto">
      <BackButton onClick={handleBack} />

      <div className="flex flex-col gap-5 items-start w-full">
        <div className="flex flex-col  gap-2 sm:gap-5 w-full">
          <h1 className="font-bold leading-[1.2] text-(--text-primary) text-[20px] sm:text-[24px]">
            Health Records
          </h1>
          <div className="flex gap-[5px] items-center">
            <Calendar className="w-[18px] h-[18px] text-(--text-primary)" />
            <p className="font-normal leading-[1.2] text-(--text-primary) text-[14px]">
              {dateLabel}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 w-full">
            <Spinner />
          </div>
        ) : (
          <PostConsultationDetails
            note={note ?? null}
            appointmentId={recordId}
            variant="shared"
          />
        )}
      </div>
    </div>
  );
};

export default HealthRecordDetailsPage;
