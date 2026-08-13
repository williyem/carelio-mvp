'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { formatDistanceToNow } from 'date-fns';
import { ROUTES } from '@/lib/routes';
import HealthAssistantActions from '@/components/dashboard/health-assistant-actions';
import HealthAssistantAppointments, {
  HealthAssistantAppointment,
} from '@/components/dashboard/health-assistant-appointments';
import ScheduleAppointmentDialog from '@/components/dashboard/schedule-appointment-dialog';
import { Patient } from '@/types/patient.types';
import { usePatientSession } from '@/integration/auth/patient';
import { useGetMyPatientAppointments } from '@/integration/appointments';
import { formatAppointmentDate, formatAppointmentTimeRange } from '@/lib/easy';
import { Spinner } from '@/components/ui/spinner';

function mapGender(gender: string | undefined): Patient['gender'] {
  const value = (gender ?? '').toLowerCase();
  if (value === 'female') return 'Female';
  if (value === 'other') return 'Other';
  return 'Male';
}

function formatTimeRemaining(startTime?: string): string {
  if (!startTime) return '';
  const start = new Date(startTime);
  if (Number.isNaN(start.getTime())) return '';
  if (start.getTime() <= Date.now()) return 'Starting soon';
  return `${formatDistanceToNow(start)} left`;
}

const PatientDashboardPage = () => {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: session,
    isLoading: isSessionLoading,
    error: sessionError,
  } = usePatientSession();

  const user = session?.user;
  const patientMongoId = user?.id;
  const patientCode = user?.patientId || user?.id;

  const {
    appointments: appointmentDocs,
    isLoading: isAppointmentsLoading,
    refetch: refetchAppointments,
  } = useGetMyPatientAppointments(patientMongoId, undefined, !!patientMongoId);

  const patient: Patient | undefined = useMemo(() => {
    if (!user) return undefined;
    return {
      id: user.id,
      name: user.fullName || 'Patient',
      fullName: user.fullName,
      dateOfBirth: user.dob ? formatAppointmentDate(user.dob) || user.dob : '',
      gender: mapGender(user.gender),
      bloodType: user.bloodType,
      email: user.email,
      phone: user.phoneNumber,
      phoneNumber: user.phoneNumber,
      address: user.address,
      allergies: [],
      chiefComplaint: '',
      patientId: patientCode || user.id,
      isRegistrationComplete: true,
    };
  }, [user, patientCode]);

  const appointments: HealthAssistantAppointment[] = useMemo(() => {
    return appointmentDocs
      .filter(
        (apt) =>
          apt.status === 'CONFIRMED' || apt.status === 'PENDING_CONFIRMATION'
      )
      .map((apt) => ({
        id: apt.id,
        date: formatAppointmentDate(apt.startTime) || apt.date || '',
        time: formatAppointmentTimeRange(apt.startTime, apt.endTime) || '',
        description: apt.doctor
          ? `Consultation with Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`
          : 'Consultation',
        timeRemaining: formatTimeRemaining(apt.startTime),
        status:
          apt.status === 'PENDING_CONFIRMATION'
            ? 'CONFIRMED'
            : (apt.status as HealthAssistantAppointment['status']),
        doctor: apt.doctor,
      }));
  }, [appointmentDocs]);

  const handleScheduleAppointment = () => {
    setIsDialogOpen(true);
  };

  const handleRecordVitals = () => {
    router.push(ROUTES.PATIENT.RECORD_VITALS);
  };

  const handleViewRecords = () => {
    router.push(ROUTES.PATIENT.HEALTH_RECORDS);
  };

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center pt-20 w-full">
        <Spinner />
      </div>
    );
  }

  if (sessionError || !patient) {
    return (
      <div className="flex flex-col gap-2 items-center pt-20 w-full text-center">
        <p className="text-(--text-primary) text-[16px]">
          Unable to load your session.
        </p>
        <p className="text-(--text-muted) text-[14px]">
          Please sign in again as a patient.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-[30px] items-center pt-10 w-full max-w-[900px] mx-auto">
        <h1 className="font-bold leading-[1.2] text-(--text-primary) max-md:text-[20px] text-[24px] w-full">
          Welcome back{patient.name ? `, ${patient.name}` : ''}
        </h1>

        <HealthAssistantActions
          onScheduleAppointment={handleScheduleAppointment}
          onRecordVitals={handleRecordVitals}
          onViewRecords={handleViewRecords}
        />

        {isAppointmentsLoading ? (
          <div className="flex justify-center w-full py-6">
            <Spinner />
          </div>
        ) : (
          <HealthAssistantAppointments appointments={appointments} />
        )}
      </div>

      <ScheduleAppointmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        patient={patient}
        portal="patient"
        onScheduled={() => {
          void refetchAppointments();
        }}
      />
    </>
  );
};

export default PatientDashboardPage;
