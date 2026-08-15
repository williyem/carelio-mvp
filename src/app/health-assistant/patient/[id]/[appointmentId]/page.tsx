'use client';

import * as React from 'react';
import { use } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { ROUTES } from '@/lib/routes';
import BackButton from '@/components/dashboard/back-button';
import { AppointmentSummarySkeleton } from '@/components/skeletons/appointment-summary-skeleton';
import { useGetPatientById } from '@/integration/patient';
import { useGetAppointmentById } from '@/integration/appointments';
import { cn } from '@/lib/utils';
import AppointmentSummaryHeader from '@/components/video-call/appointment-summary-header';
import PostConsultationPageDetails from '@/components/video-call/post-consultation-page-details';
import VitalsTab from '@/components/video-call/vitals-tab';
import { useGetConsultationNoteByAppointment } from '@/integration/appointments/queries/useGetConsultationNoteByAppointment';
import { EmptyState } from '@/components/ui/empty-state';

type TabType = 'SOAP notes' | 'Vitals';

export default function HealthAssistantAppointmentSummaryPage({
  params,
}: {
  params: Promise<{ id: string; appointmentId: string }>;
}) {
  const { id, appointmentId } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<TabType>('SOAP notes');

  const { data: patient, isLoading: isLoadingPatient } = useGetPatientById(
    id,
    true,
    'health-assistant'
  );
  const { data: appointment } = useGetAppointmentById(appointmentId);
  const { data: currentNote, isLoading: isLoadingNotes } =
    useGetConsultationNoteByAppointment(appointmentId);

  if (isLoadingPatient || isLoadingNotes) {
    return (
      <div className="w-[900px] max-w-full mx-auto">
        <AppointmentSummarySkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-[900px] max-w-full mx-auto">
      <div className="space-y-6">
        <BackButton
          onClick={() =>
            router.push(ROUTES.HEALTH_ASSISTANT.PATIENT.DETAILS(id))
          }
        />

        <h1 className="text-2xl font-bold text-gray-900">
          Post-Consultation Summary
        </h1>
      </div>

      <AppointmentSummaryHeader
        appointment={appointment}
        patientName={patient?.fullName}
      />

      <div className="bg-[#F9F9F9] p-1 rounded-full flex overflow-x-auto no-scrollbar">
        {(['SOAP notes', 'Vitals'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-3 px-6 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
              activeTab === tab
                ? 'bg-white border-(--border-stroke) border text-gray-900'
                : 'text-gray-900 hover:text-gray-700'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[400px] space-y-6">
        {activeTab === 'SOAP notes' && (
          <div className="space-y-6">
            {currentNote ? (
              <PostConsultationPageDetails
                note={currentNote}
                hideVitals={true}
                variant="shared"
              />
            ) : (
              <EmptyState
                icon={<Search className="h-6 w-6 text-(--text-muted)" />}
                title="No session summary available"
                description="Shared notes from this visit will appear here once the doctor sends them."
              />
            )}
          </div>
        )}

        {activeTab === 'Vitals' && (
          <VitalsTab appointmentId={appointmentId} hideTitle={true} />
        )}
      </div>
    </div>
  );
}
