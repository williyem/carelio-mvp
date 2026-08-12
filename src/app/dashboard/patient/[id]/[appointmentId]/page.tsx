'use client';

import * as React from 'react';
import Link from 'next/link';
import { use, useState } from 'react';
import { ArrowLeft, Search, History, Database, Info } from 'lucide-react';
import { AppointmentSummarySkeleton } from '@/components/skeletons/appointment-summary-skeleton';
import { useGetPatientById } from '@/integration/patient';
import {
  AppointmentNote,
  useGetAppointmentById,
} from '@/integration/appointments';
import { cn } from '@/lib/utils';
import HealthRecordRow from '@/components/video-call/health-record-row';
import PostConsultationPageDetails from '@/components/video-call/post-consultation-page-details';
import VitalsTab from '@/components/video-call/vitals-tab';
import { useGetConsultationNoteByAppointment } from '@/integration/appointments/queries/useGetConsultationNoteByAppointment';
import { EmptyState } from '@/components/ui/empty-state';

type TabType =
  | 'SOAP notes'
  | 'Lab Results'
  | 'Forms'
  | 'HIE Records'
  | 'Vitals';

export default function AppointmentSummaryPage({
  params,
}: {
  params: Promise<{ id: string; appointmentId: string }>;
}) {
  const resolvedParams = use(params);
  const { id, appointmentId } = resolvedParams;
  const [activeTab, setActiveTab] = useState<TabType>('SOAP notes');

  const { data: patient, isLoading: isLoadingPatient } = useGetPatientById(id);
  const { data: appointment } = useGetAppointmentById(appointmentId);
  const { data: currentNote, isLoading: isLoadingNotes } =
    useGetConsultationNoteByAppointment(appointmentId);

  if (isLoadingPatient || isLoadingNotes) {
    return <AppointmentSummarySkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-6">
        <Link
          href={`/dashboard/patient/${id}`}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-2xl font-bold  text-gray-900">
            Post-Consultation Summary{' '}
          </h1>
        </div>
      </div>

      <HealthRecordRow
        key={currentNote?.id}
        note={{ ...currentNote, appointment } as AppointmentNote}
        selectedNote={null}
        onSelect={() => {}}
        viewOnly={true}
        patient={patient}
      />

      {/* Tabs Selector */}
      <div className="bg-[#F9F9F9] p-1 rounded-full flex overflow-x-auto no-scrollbar">
        {(
          [
            'SOAP notes',
            'Lab Results',
            'Forms',
            'HIE Records',
            'Vitals',
          ] as TabType[]
        ).map((tab) => (
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

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'SOAP notes' && (
          <div className=" border-none bg-white shadow-none">
            {currentNote ? (
              <PostConsultationPageDetails
                note={currentNote}
                hideVitals={true}
              />
            ) : (
              <EmptyState
                icon={<Search className="h-8 w-8 text-gray-300" />}
                message="No session summary available for this appointment"
              />
            )}
          </div>
        )}

        {activeTab === 'Vitals' && (
          <div className="max-w-full">
            <VitalsTab appointmentId={appointmentId} hideTitle={true} />
          </div>
        )}

        {activeTab === 'Lab Results' && (
          <EmptyState
            icon={<Search className="h-8 w-8 text-gray-300" />}
            message="No lab results available for this appointment"
          />
        )}

        {activeTab === 'Forms' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3 text-brand-blue font-medium">
              <Info className="h-5 w-5 shrink-0" />
              <p className="text-[15px]">
                Forms are synced with EPIC via API integration
              </p>
            </div>
            <EmptyState
              icon={<Search className="h-8 w-8 text-gray-300" />}
              message="No forms available for this appointment"
            />
          </div>
        )}

        {activeTab === 'HIE Records' && (
          <div className="space-y-6">
            <div className="bg-[#EEF2FF] border border-blue-100/50 rounded-xl p-4 flex items-center gap-3 text-[#6366F1] font-medium">
              <Database className="h-5 w-5 shrink-0" />
              <p className="text-[15px]">
                Records aggregated from Health Information Exchange
              </p>
            </div>
            <EmptyState
              icon={
                <div className="p-4 border-2 border-dashed border-gray-100 rounded-xl">
                  <History className="h-8 w-8 text-gray-300" />
                </div>
              }
              message="No HIE records available for this appointment"
            />
          </div>
        )}
      </div>
    </div>
  );
}
