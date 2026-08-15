'use client';

import { useMemo } from 'react';
import { toast } from 'sonner';
import AiSummaryPanel from '@/components/dashboard/ai-summary-panel';
import { getErrorMessage } from '@/integration';
import {
  useSummarizeVisit,
  useVisitAiSummary,
} from '@/integration/clinical-intelligence';
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
  const { data: savedSummary, isLoading: isLoadingSaved } =
    useVisitAiSummary(appointmentId);
  const summarize = useSummarizeVisit(appointmentId);
  const { data: vitals } = useGetVitalsByAppointmentQuery(appointmentId);

  const hasConfirmedVitals = useMemo(
    () => (vitals ?? []).some((vital) => vital.status === 'confirmed'),
    [vitals]
  );

  const canGenerate = hasSoapContent(note, soapFields) || hasConfirmedVitals;
  const summary = savedSummary?.summary ?? null;
  const generatedAt = savedSummary?.generatedAt ?? null;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    const regenerate = Boolean(summary);
    try {
      await summarize.mutateAsync({ regenerate });
      toast.success(
        regenerate ? 'Visit summary regenerated' : 'Visit summary generated'
      );
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not generate visit summary'));
    }
  };

  if (isLoadingSaved && !summary) {
    return null;
  }

  return (
    <AiSummaryPanel
      title="AI visit summary"
      description="Saved summary of this consultation’s SOAP notes and confirmed vitals. Regenerate only when notes change."
      summary={summary}
      generatedAt={generatedAt}
      isPending={summarize.isPending}
      canGenerate={canGenerate}
      emptyMessage="Add SOAP notes or confirm vitals for this visit before generating a summary."
      onGenerate={() => void handleGenerate()}
    />
  );
}
