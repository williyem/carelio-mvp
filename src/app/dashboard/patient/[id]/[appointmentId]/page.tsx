'use client';

import * as React from 'react';
import Link from 'next/link';
import { use, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { AppointmentSummarySkeleton } from '@/components/skeletons/appointment-summary-skeleton';
import { useGetPatientById } from '@/integration/patient';
import { SoapNote, useGetAppointmentById } from '@/integration/appointments';
import { cn } from '@/lib/utils';
import AppointmentSummaryHeader from '@/components/video-call/appointment-summary-header';
import PostConsultationPageDetails from '@/components/video-call/post-consultation-page-details';
import VitalsTab from '@/components/video-call/vitals-tab';
import ConsultationNoteActions from '@/components/video-call/consultation-note-actions';
import { soapFieldsFromNote } from '@/components/video-call/post-consultation-details';
import VisitAiSummaryTab from '@/components/video-call/visit-ai-summary-tab';
import { useGetConsultationNoteByAppointment } from '@/integration/appointments/queries/useGetConsultationNoteByAppointment';
import { EmptyState } from '@/components/ui/empty-state';
import { useSoapDraftStore } from '@/stores/soap-draft-store';
import useUser from '@/hooks/useUser';

type TabType = 'SOAP notes' | 'Vitals' | 'AI summary';

export default function AppointmentSummaryPage({
  params,
}: {
  params: Promise<{ id: string; appointmentId: string }>;
}) {
  const resolvedParams = use(params);
  const { id, appointmentId } = resolvedParams;
  const [activeTab, setActiveTab] = useState<TabType>('SOAP notes');
  const { userId } = useUser();

  const { data: patient, isLoading: isLoadingPatient } = useGetPatientById(id);
  const { data: appointment } = useGetAppointmentById(appointmentId);
  const { data: currentNote, isLoading: isLoadingNotes } =
    useGetConsultationNoteByAppointment(appointmentId);
  const draft = useSoapDraftStore((s) => s.byAppointmentId[appointmentId]);

  const [soapFields, setSoapFields] = React.useState<Required<SoapNote>>(
    soapFieldsFromNote(currentNote, draft)
  );

  React.useEffect(() => {
    setSoapFields(soapFieldsFromNote(currentNote, draft));
  }, [currentNote, draft]);

  if (isLoadingPatient || isLoadingNotes) {
    return <AppointmentSummarySkeleton />;
  }

  const appointmentDoctorId =
    appointment?.doctorId || appointment?.doctor?.id || '';
  const canManageNote = Boolean(
    userId && appointmentDoctorId && userId === appointmentDoctorId
  );
  const isDraft = currentNote?.status !== 'FINAL';
  const canEdit = canManageNote && isDraft;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-6">
        <Link
          href={`/dashboard/patient/${id}`}
          className="flex items-center gap-2 text-(--text-muted) hover:text-(--text-primary) transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>

        <h1 className="text-2xl font-bold text-(--text-primary)">
          Post-Consultation Summary
        </h1>
      </div>

      <AppointmentSummaryHeader
        appointment={appointment}
        patientName={patient?.fullName}
      />

      <div className="bg-(--bg-primary) p-1 rounded-full flex overflow-x-auto no-scrollbar">
        {(['SOAP notes', 'Vitals', 'AI summary'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-3 px-6 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
              activeTab === tab
                ? 'bg-(--bg-white) border-(--border-stroke) border text-(--text-primary)'
                : 'text-(--text-primary) hover:text-(--text-gray)'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[400px] space-y-6">
        {activeTab === 'SOAP notes' && (
          <div className="space-y-6">
            {currentNote || canEdit ? (
              <>
                <PostConsultationPageDetails
                  note={currentNote ?? null}
                  hideVitals={true}
                  editable={canEdit}
                  soapFields={soapFields}
                  onSoapChange={(key, value) =>
                    setSoapFields((prev) => ({ ...prev, [key]: value }))
                  }
                />
                {canManageNote ? (
                  <ConsultationNoteActions
                    appointmentId={appointmentId}
                    note={currentNote ?? null}
                    soapFields={soapFields}
                  />
                ) : null}
              </>
            ) : (
              <EmptyState
                icon={<Search className="h-6 w-6 text-(--text-muted)" />}
                title="No session summary available"
                description="A summary will appear here after the visit notes are saved."
              />
            )}
          </div>
        )}

        {activeTab === 'Vitals' && (
          <VitalsTab appointmentId={appointmentId} hideTitle={true} />
        )}

        {activeTab === 'AI summary' && (
          <VisitAiSummaryTab
            appointmentId={appointmentId}
            note={currentNote ?? null}
            soapFields={soapFields}
          />
        )}
      </div>
    </div>
  );
}
