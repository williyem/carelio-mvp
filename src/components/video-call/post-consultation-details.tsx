'use client';

import { AppointmentNote, SoapNote } from '@/integration/appointments/types';
import VitalsTab from './vitals-tab';
import SOAPSection from '@/components/dashboard/soap-section';
import SoapNoteEditor from './soap-note-editor';
import { useSoapDraftStore } from '@/stores/soap-draft-store';
import { EmptyState } from '@/components/ui/empty-state';
import { Search } from 'lucide-react';
import { hasSoapContent, SOAP_SECTION_KEYS } from '@/lib/soap-note';

export type ConsultationSummaryVariant = 'doctor' | 'shared';

interface PostConsultationDetailsProps {
  note: AppointmentNote | null;
  appointmentId?: string;
  variant?: ConsultationSummaryVariant;
  hideVitals?: boolean;
  editable?: boolean;
  soapFields?: SoapNote;
  onSoapChange?: (
    key: (typeof SOAP_SECTION_KEYS)[number],
    value: string
  ) => void;
  emptyMessage?: string;
}

export function soapFieldsFromNote(
  note?: AppointmentNote | null,
  draft?: SoapNote
): Required<SoapNote> {
  return {
    subjective:
      draft?.subjective || note?.soapNote?.subjective || note?.subjective || '',
    objective:
      draft?.objective || note?.soapNote?.objective || note?.objective || '',
    assessment:
      draft?.assessment || note?.soapNote?.assessment || note?.assessment || '',
    plan: draft?.plan || note?.soapNote?.plan || note?.plan || '',
  };
}

const PostConsultationDetails = ({
  note,
  appointmentId: appointmentIdProp,
  variant = 'doctor',
  hideVitals = false,
  editable = false,
  soapFields,
  onSoapChange,
  emptyMessage = 'No session summary available.',
}: PostConsultationDetailsProps) => {
  const draft = useSoapDraftStore((s) =>
    note?.appointmentId ? s.byAppointmentId[note.appointmentId] : undefined
  );
  const fields = soapFields ?? soapFieldsFromNote(note, draft);
  const appointmentId = appointmentIdProp || note?.appointmentId;
  const isShared = variant === 'shared';
  const sharedSections = SOAP_SECTION_KEYS.filter((key) => {
    if (!hasSoapContent(fields[key])) return false;
    if (note?.sharedSoapFields) {
      return note.sharedSoapFields.includes(key);
    }
    return true;
  });
  const hasSharedNotes = sharedSections.length > 0;

  if (isShared && !hasSharedNotes) {
    return (
      <div className="flex flex-col gap-6 h-full">
        {!hideVitals && appointmentId && (
          <VitalsTab appointmentId={appointmentId} />
        )}
        <EmptyState
          icon={<Search className="h-8 w-8 text-gray-300" />}
          message="The doctor has not shared notes from this visit yet"
          description="Vitals from this visit are shown above. SOAP notes will appear here once the doctor shares them."
        />
      </div>
    );
  }

  if (!note && !editable) {
    return (
      <div className="flex flex-col gap-6">
        {!hideVitals && appointmentId && (
          <VitalsTab appointmentId={appointmentId} />
        )}
        <div className="py-12 text-center text-gray-500">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in slide-in-from-right-4 duration-300">
      {isShared ? (
        <div className="flex flex-col gap-4 w-full">
          {sharedSections.map((key) => (
            <SOAPSection key={key} type={key} content={fields[key]} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          {SOAP_SECTION_KEYS.map((key) =>
            editable && onSoapChange ? (
              <SoapNoteEditor
                key={key}
                type={key}
                value={fields[key] || ''}
                onChange={(value) => onSoapChange(key, value)}
                placeholder={`Enter ${key} notes...`}
              />
            ) : (
              <SOAPSection key={key} type={key} content={fields[key]} />
            )
          )}
        </div>
      )}
      {!hideVitals && appointmentId && (
        <VitalsTab appointmentId={appointmentId} />
      )}
    </div>
  );
};

export default PostConsultationDetails;
