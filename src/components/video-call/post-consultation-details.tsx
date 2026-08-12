'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { AppointmentNote } from '@/integration/appointments/types';
import HealthRecordRow from './health-record-row';
import VitalsTab from './vitals-tab';
import SoapSection from './soap-section';

interface PostConsultationDetailsProps {
  note: AppointmentNote;
  patient?: { fullName: string };
}

const PostConsultationDetails = ({
  note,
  patient,
}: PostConsultationDetailsProps) => {
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col gap-6 h-full">
        <HealthRecordRow
          key={note?.id}
          note={note}
          selectedNote={null}
          onSelect={() => {}}
          viewOnly={true}
          patient={patient}
        />

        <ScrollArea className="flex-1 min-h-[400px] max-h-[60vh] -mx-4 px-4">
          <div className="space-y-4 pb-4">
            {(['subjective', 'objective', 'assessment', 'plan'] as const).map(
              (key) => (
                <SoapSection
                  key={key}
                  type={key}
                  content={note?.soapNote?.[key] || note[key]}
                />
              )
            )}
          </div>
          <VitalsTab appointmentId={note.appointmentId} />
        </ScrollArea>
      </div>
    </div>
  );
};

export default PostConsultationDetails;
