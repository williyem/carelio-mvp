'use client';

import { ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppointmentNote } from '@/integration/appointments/types';
import HealthRecordRow from './health-record-row';
import VitalsTab from './vitals-tab';

interface HealthRecordDetailProps {
  note: AppointmentNote;
  onBack: () => void;
}

const SOAP_CONFIG = {
  subjective: {
    bg: '#E8F4FC',
    text: '#1485D0',
    label: "Patient's description of the problem",
  },
  objective: {
    bg: '#E7F7E9',
    text: '#0B7E17',
    label: 'Clinical findings and measurements',
  },
  assessment: {
    bg: '#F6F6F6',
    text: '#444545',
    label:
      'The clinician analyzes the subjective and objective data to determine what is going on.',
  },
  plan: {
    bg: '#FDFAE7',
    text: '#A8900D',
    label: 'Treatment plan and follow-up',
  },
};

const SoapSection = ({
  type,
  content,
}: {
  type: 'subjective' | 'objective' | 'assessment' | 'plan';
  content?: string;
}) => {
  const config = SOAP_CONFIG[type];

  return (
    <div className="space-y-3 bg-(--bg-white) border border-(--border-stroke) rounded-[10px] p-4">
      <div className="flex items-center gap-3">
        <div
          style={{ backgroundColor: config.bg, color: config.text }}
          className="size-10 flex items-center justify-center font-normal text-lg rounded-full shrink-0"
        >
          {type.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <p className="capitalize font-bold text-(--text-primary) leading-none mb-1">
            {type}
          </p>
        </div>
      </div>
      <p className="text-sm text-(--text-secondary) font-normal">
        {config.label}
      </p>

      <div className="w-full bg-(--bg-input) border border-(--border-input) rounded-[8px] p-4 text-(--text-gray) text-[15px] font-normal leading-relaxed">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p className="text-(--text-muted)">No {type} notes recorded</p>
        )}
      </div>
    </div>
  );
};

const HealthRecordDetail = ({ note, onBack }: HealthRecordDetailProps) => {
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col gap-6 h-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-(--text-muted) font-bold hover:text-(--text-primary) transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <HealthRecordRow
          key={note?.id}
          note={note}
          selectedNote={null}
          onSelect={() => {}}
          viewOnly={true}
        />

        <ScrollArea className="flex-1 min-h-0 -mx-4 px-4">
          <div className="space-y-4 pb-4">
            {(['subjective', 'objective', 'assessment', 'plan'] as const).map(
              (key) => (
                <SoapSection
                  key={key}
                  type={key}
                  content={note.soapNote?.[key] || note[key]}
                />
              )
            )}
            <div className="space-y-3 bg-(--bg-white) border border-(--border-stroke) rounded-[10px] p-4">
              <p className="font-bold text-(--text-primary)">Measurements</p>
              <p className="text-sm text-(--text-secondary) font-normal">
                Readings recorded during this appointment.
              </p>
              <VitalsTab
                appointmentId={note.appointmentId || note.appointment?.id}
                hideTitle
              />
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default HealthRecordDetail;
