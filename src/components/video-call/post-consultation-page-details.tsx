'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { AppointmentNote } from '@/integration/appointments/types';
import VitalsTab from './vitals-tab';
import SoapSection from './soap-section';
import { Button } from '../ui/button';

interface PostConsultationPageDetailsProps {
  note: AppointmentNote;
  hideVitals?: boolean;
}

const PostConsultationPageDetails = ({
  note,
  hideVitals = false,
}: PostConsultationPageDetailsProps) => {
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col gap-6 h-full">
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
          {!hideVitals && <VitalsTab appointmentId={note.appointmentId} />}
        </ScrollArea>
        {/* <div className="flex items-center justify-between gap-2">
          <Button
            onClick={() => {}}
            className="w-full bg-brand-blue rounded-full hover:bg-brand-blue/90 text-white font-bold h-12"
          >
            Approve & Send to Patient
          </Button>
          <Button
            onClick={() => {}}
            variant={'outline'}
            className="w-full text-brand-blue hover:text-brand-blue rounded-full hover:bg-brand-blue/10 border-brand-blue font-bold h-12"
          >
            Export to Epic
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default PostConsultationPageDetails;
