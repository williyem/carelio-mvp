'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  useShareConsultationPlan,
  useSubmitSoapNotes,
  useUpdateConsultationNote,
} from '@/integration/appointments';
import type {
  AppointmentNote,
  PlanShareRecipient,
  SoapNote,
} from '@/integration/appointments/types';
import { hasSoapContent, SOAP_SECTION_KEYS } from '@/lib/soap-note';
import type { SoapSectionType } from '@/lib/soap-note';
import { toast } from 'sonner';
import SendPlanDialog from './send-plan-dialog';

interface ConsultationNoteActionsProps {
  appointmentId: string;
  note: AppointmentNote | null;
  soapFields: Required<SoapNote>;
  onClose?: () => void;
  showClose?: boolean;
}

const ConsultationNoteActions = ({
  appointmentId,
  note,
  soapFields,
  onClose,
  showClose = false,
}: ConsultationNoteActionsProps) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const updateNoteMutation = useUpdateConsultationNote();
  const submitSoapMutation = useSubmitSoapNotes();
  const sharePlanMutation = useShareConsultationPlan();

  const isLocked = note?.status === 'FINAL';
  const canSendPlan = SOAP_SECTION_KEYS.some((key) =>
    hasSoapContent(soapFields[key])
  );
  const sentToPatient = Boolean(note?.planSharedWithPatientAt);
  const isBusy =
    updateNoteMutation.isPending ||
    submitSoapMutation.isPending ||
    sharePlanMutation.isPending;

  const persistDraft = async (options?: { silent?: boolean }) => {
    const payload = { ...soapFields, action: 'save' as const };
    if (note?.id) {
      await updateNoteMutation.mutateAsync({
        noteId: note.id,
        data: payload,
      });
    } else {
      await submitSoapMutation.mutateAsync({
        appointmentId,
        data: payload,
      });
    }
    if (!options?.silent) {
      toast.success('Draft saved');
    }
  };

  const handleSave = async () => {
    try {
      await persistDraft();
    } catch {
      toast.error('Could not save draft');
    }
  };

  const handleSendPlan = async (
    recipients: PlanShareRecipient[],
    fields: SoapSectionType[]
  ) => {
    try {
      if (!isLocked) {
        await persistDraft({ silent: true });
      }
      await sharePlanMutation.mutateAsync({
        appointmentId,
        data: { recipients, fields },
      });
      const labels = recipients.map((recipient) =>
        recipient === 'patient' ? 'patient' : 'health assistant'
      );
      toast.success(
        recipients.includes('patient')
          ? `Notes sent to the ${labels.join(' and ')}. The note is now locked.`
          : `Notes sent to the ${labels.join(' and ')}`
      );
      setIsShareOpen(false);
    } catch {
      toast.error('Could not send the SOAP notes');
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button
          onClick={handleSave}
          disabled={isBusy || isLocked}
          variant="outline"
          className="flex-1 text-brand-blue hover:text-brand-blue rounded-full hover:bg-brand-blue/10 border-brand-blue font-bold h-12"
        >
          {isBusy && !sharePlanMutation.isPending ? <Spinner /> : 'Save'}
        </Button>
        <Button
          onClick={() => setIsShareOpen(true)}
          disabled={isBusy || !canSendPlan}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold h-12"
        >
          {sentToPatient ? 'Shared' : 'Share'}
        </Button>
        {showClose && onClose && (
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 rounded-full font-bold h-12"
          >
            Close
          </Button>
        )}
      </div>
      <SendPlanDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        note={note}
        soapFields={soapFields}
        isSending={sharePlanMutation.isPending || updateNoteMutation.isPending}
        onSend={handleSendPlan}
      />
    </>
  );
};

export default ConsultationNoteActions;
