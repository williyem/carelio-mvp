'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import AiSummaryPanel from '@/components/dashboard/ai-summary-panel';
import { getErrorMessage } from '@/integration';
import { useSummarizeVisit } from '@/integration/clinical-intelligence';
import { useGetVitalsByAppointmentQuery } from '@/integration/vitals';
import type {
  AppointmentNote,
  SoapNote,
} from '@/integration/appointments/types';

function hasSoapContent(
  note: AppointmentNote | null | undefined,
  soapFields?: Required<SoapNote>
) {
  const soap = soapFields || note?.soapNote || note;
  if (!soap) return false;
  return Boolean(
    soap.subjective?.trim() ||
    soap.objective?.trim() ||
    soap.assessment?.trim() ||
    soap.plan?.trim()
  );
}

export default function VisitAiSummaryTab({
  appointmentId,
  note,
  soapFields,
}: {
  appointmentId: string;
  note?: AppointmentNote | null;
  soapFields?: Required<SoapNote>;
}) {
  const summarize = useSummarizeVisit();
  const { data: vitals } = useGetVitalsByAppointmentQuery(appointmentId);
  const [summary, setSummary] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const hasConfirmedVitals = useMemo(
    () => (vitals ?? []).some((vital) => vital.status === 'confirmed'),
    [vitals]
  );

  const canGenerate = hasSoapContent(note, soapFields) || hasConfirmedVitals;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    try {
      const result = await summarize.mutateAsync(appointmentId);
      setSummary(result.summary);
      setGeneratedAt(result.generatedAt);
      toast.success('Visit summary generated');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not generate visit summary'));
    }
  };

  return (
    <AiSummaryPanel
      title="AI visit summary"
      description="Summarizes this consultation’s SOAP notes and confirmed vitals."
      summary={summary}
      generatedAt={generatedAt}
      isPending={summarize.isPending}
      canGenerate={canGenerate}
      emptyMessage="Add SOAP notes or confirm vitals for this visit before generating a summary."
      onGenerate={() => void handleGenerate()}
    />
  );
}
