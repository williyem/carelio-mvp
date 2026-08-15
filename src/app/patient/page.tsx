'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { formatDistanceToNow } from 'date-fns';
import { Info } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import HealthAssistantActions from '@/components/dashboard/health-assistant-actions';
import HealthAssistantAppointments, {
  HealthAssistantAppointment,
} from '@/components/dashboard/health-assistant-appointments';
import ScheduleAppointmentDialog from '@/components/dashboard/schedule-appointment-dialog';
import { Button } from '@/components/ui/button';
import { Patient } from '@/types/patient.types';
import { Appointment } from '@/types/appointment.types';
import { usePatientSession } from '@/integration/auth/patient';
import { useGetMyPatientAppointments } from '@/integration/appointments';
import { formatAppointmentDate, formatAppointmentTimeRange } from '@/lib/easy';
import { isUpcomingAppointment } from '@/lib/appointment-status';
import { Spinner } from '@/components/ui/spinner';
import {
  formatMissingClinicalPrompt,
  listMissingPatientClinicalFields,
  clinicalReviewStorageKey,
} from '@/lib/patient-clinical';

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

function subscribeClinicalReview(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

function useHasReviewedClinical(patientId?: string) {
  return useSyncExternalStore(
    subscribeClinicalReview,
    () =>
      Boolean(
        patientId &&
        window.localStorage.getItem(clinicalReviewStorageKey(patientId))
      ),
    () => false
  );
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
      allergies: user.allergies ?? [],
      medications: user.medications ?? [],
      conditions: user.conditions ?? [],
      emergencyContact: user.emergencyContact,
      chiefComplaint: '',
      patientId: patientCode || user.id,
      isRegistrationComplete: Boolean(user.isRegistrationComplete),
    };
  }, [user, patientCode]);

  const appointments: HealthAssistantAppointment[] = useMemo(() => {
    return appointmentDocs
      .filter((apt) => isUpcomingAppointment(apt))
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
        startTime: apt.startTime,
        endTime: apt.endTime,
        raw: apt as unknown as Appointment,
      }));
  }, [appointmentDocs]);

  const missingClinical = useMemo(
    () =>
      listMissingPatientClinicalFields({
        allergies: user?.allergies,
        conditions: user?.conditions,
        emergencyContact: user?.emergencyContact,
      }),
    [user]
  );
  const hasReviewedClinical = useHasReviewedClinical(user?.id);
  const showClinicalPrompt = missingClinical.length > 0 && !hasReviewedClinical;
  const clinicalPrompt = formatMissingClinicalPrompt(missingClinical);

  const handleScheduleAppointment = () => {
    setIsDialogOpen(true);
  };

  const handleRecordVitals = () => {
    router.push(ROUTES.PATIENT.PROFILE);
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

        {showClinicalPrompt && clinicalPrompt && (
          <div className="bg-[#FDFAE7] w-full border border-[#FFE0A3] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 text-gray-900">
            <div className="flex items-start gap-4 flex-1">
              <div className="h-10 w-10 rounded-full bg-white border border-[#FFE0A3] flex items-center justify-center shrink-0">
                <Info className="h-5 w-5 text-amber-600" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[15px] font-bold">
                  Help your doctor care for you
                </h4>
                <p className="text-sm text-amber-900">{clinicalPrompt}</p>
              </div>
            </div>
            <Button
              variant="brand"
              className="rounded-full h-10 px-5 shrink-0"
              onClick={() => router.push(ROUTES.PATIENT.PROFILE)}
            >
              Add details
            </Button>
          </div>
        )}

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
          <HealthAssistantAppointments
            appointments={appointments}
            patient={patient}
            enableJoin
            startLabel="Join call"
          />
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
