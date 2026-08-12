'use client';

import { useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { ROUTES } from '@/lib/routes';
import HealthAssistantActions from '@/components/dashboard/health-assistant-actions';
import HealthAssistantAppointments, {
  HealthAssistantAppointment,
} from '@/components/dashboard/health-assistant-appointments';
import ScheduleAppointmentDialog from '@/components/dashboard/schedule-appointment-dialog';
import { Patient } from '@/types/patient.types';

const HealthAssistantPage = () => {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // TODO: Get actual patient data from context/auth
  // For now, using mock data
  const patientId = 'patient-1';
  const patient: Patient = {
    id: patientId,
    name: 'Current Patient',
    dateOfBirth: '12th April, 1990',
    gender: 'Male' as const,
    bloodType: 'A+',
    email: 'patient@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Boston, MA 02101',
    allergies: [],
    chiefComplaint: '',
    patientId: '1234567890',
  };

  const handleScheduleAppointment = () => {
    setIsDialogOpen(true);
  };

  const handleRecordVitals = () => {
    router.push(ROUTES.PATIENT.RECORD_VITALS);
  };

  const handleViewRecords = () => {
    // TODO: Get actual patient ID from context/auth
    // For now, using a placeholder ID
    const patientId = 'patient-1';
    router.push(ROUTES.PATIENT.HEALTH_RECORDS);
  };

  // TODO: Fetch appointments from API
  const appointments: HealthAssistantAppointment[] = [
    {
      id: '1',
      date: 'Dec 4, 2025',
      time: '02:30 PM',
      description: 'Follow-up for hypertension management',
      timeRemaining: '30mins left',
      status: 'CONFIRMED',
      doctor: {},
    },
    {
      id: '2',
      date: 'Dec 4, 2025',
      time: '02:30 PM',
      description: 'Follow-up for hypertension management',
      timeRemaining: '1hr 30mins left',
      status: 'CONFIRMED',
      doctor: {},
    },
    {
      id: '3',
      date: 'Dec 4, 2025',
      time: '02:30 PM',
      description: 'Follow-up for hypertension management',
      timeRemaining: '1hr 30mins left',
      status: 'CONFIRMED',
      doctor: {},
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-[30px] items-center pt-10 w-full max-w-[900px] mx-auto">
        <h1 className="font-bold leading-[1.2] text-(--text-primary) max-md:text-[20px] text-[24px] w-full">
          Welcome back
        </h1>

        <HealthAssistantActions
          onScheduleAppointment={handleScheduleAppointment}
          onRecordVitals={handleRecordVitals}
          onViewRecords={handleViewRecords}
        />

        <HealthAssistantAppointments appointments={appointments} />
      </div>

      <ScheduleAppointmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        patient={patient}
      />
    </>
  );
};

export default HealthAssistantPage;
