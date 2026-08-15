'use client';

import { useState } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetPatientNotes } from '@/integration/appointments';
import { AppointmentNote } from '@/integration/appointments/types';
import { Spinner } from '@/components/ui/spinner';
import HealthRecordRow from './health-record-row';
import HealthRecordDetail from './health-record-detail';
import { EmptyState } from '@/components/ui/empty-state';

interface HealthRecordsListProps {
  patientId: string;
  onBack?: () => void;
}

const HealthRecordsList = ({ patientId, onBack }: HealthRecordsListProps) => {
  const [selectedNote, setSelectedNote] = useState<AppointmentNote | null>(
    null
  );
  const [viewingDetail, setViewingDetail] = useState(false);

  const { data: notesData, isLoading } = useGetPatientNotes(patientId, {
    limit: 20,
    page: 1,
  });

  const notes = notesData?.docs || [];

  const handleNoteSelect = (note: AppointmentNote) => {
    setSelectedNote(note);
    setViewingDetail(true);
  };

  const handleBackFromDetail = () => {
    setViewingDetail(false);
    setSelectedNote(null);
  };

  if (viewingDetail && selectedNote) {
    return (
      <HealthRecordDetail note={selectedNote} onBack={handleBackFromDetail} />
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col gap-6 h-full">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-(--text-muted) font-bold hover:text-(--text-primary) transition-colors w-fit cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        ) : null}

        <div>
          <h3 className="font-bold text-(--text-primary)">Visit history</h3>
          <p className="text-sm text-(--text-secondary) mt-1">
            Each appointment includes SOAP notes and measurements from that
            visit.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : notes.length > 0 ? (
          <ScrollArea className="flex-1 -mx-4 px-4">
            <div className="space-y-3 pb-4">
              {notes.map((note) => (
                <HealthRecordRow
                  key={note.id}
                  note={note}
                  selectedNote={selectedNote}
                  onSelect={handleNoteSelect}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <EmptyState
            icon={<FileText className="h-6 w-6 text-(--text-muted)" />}
            title="No health records found"
            description="SOAP notes and measurements from each visit will appear here"
          />
        )}
      </div>
    </div>
  );
};

export default HealthRecordsList;
