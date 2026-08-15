'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AiSummaryPanel from '@/components/dashboard/ai-summary-panel';
import { getErrorMessage } from '@/integration';
import { useGetPatientNotes } from '@/integration/appointments';
import {
  usePatientAiSummary,
  useSummarizePatientNotes,
} from '@/integration/clinical-intelligence';
import type { AppointmentNote } from '@/integration/appointments/types';
import { cn } from '@/lib/utils';

function noteHasSoap(note: AppointmentNote) {
  const soap = note.soapNote || note;
  return Boolean(
    soap.subjective?.trim() ||
    soap.objective?.trim() ||
    soap.assessment?.trim() ||
    soap.plan?.trim()
  );
}

type PatientClinicalSummaryContextValue = {
  isLoading: boolean;
  hasNotes: boolean;
  isPending: boolean;
  summary: string | null;
  generatedAt: string | null;
  cached: boolean;
  generate: (regenerate?: boolean) => Promise<void>;
};

const PatientClinicalSummaryContext =
  createContext<PatientClinicalSummaryContextValue | null>(null);

function usePatientClinicalSummaryContext() {
  const value = useContext(PatientClinicalSummaryContext);
  if (!value) {
    throw new Error(
      'Patient clinical summary components must be used within PatientClinicalSummaryProvider'
    );
  }
  return value;
}

export function PatientClinicalSummaryProvider({
  patientId,
  children,
}: {
  patientId: string;
  children: ReactNode;
}) {
  const { data: notesData, isLoading: isLoadingNotes } = useGetPatientNotes(
    patientId,
    { limit: 20 }
  );
  const { data: savedSummary, isLoading: isLoadingSaved } =
    usePatientAiSummary(patientId);
  const summarize = useSummarizePatientNotes(patientId);

  const hasNotes = useMemo(() => {
    const docs = notesData?.docs ?? [];
    return docs.some((note) => noteHasSoap(note));
  }, [notesData]);

  const summary = savedSummary?.summary ?? null;
  const generatedAt = savedSummary?.generatedAt ?? null;
  const cached = Boolean(savedSummary?.cached ?? savedSummary);

  const generate = useCallback(
    async (regenerate = false) => {
      if (!hasNotes) {
        toast.error('No SOAP notes yet to summarize');
        return;
      }
      try {
        await summarize.mutateAsync({ regenerate });
        toast.success(
          regenerate
            ? 'Clinical summary regenerated'
            : 'Clinical summary generated'
        );
      } catch (error) {
        toast.error(getErrorMessage(error, 'Could not generate summary'));
      }
    },
    [hasNotes, summarize]
  );

  const value = useMemo(
    () => ({
      isLoading: isLoadingNotes || isLoadingSaved,
      hasNotes,
      isPending: summarize.isPending,
      summary,
      generatedAt,
      cached,
      generate,
    }),
    [
      isLoadingNotes,
      isLoadingSaved,
      hasNotes,
      summarize.isPending,
      summary,
      generatedAt,
      cached,
      generate,
    ]
  );

  return (
    <PatientClinicalSummaryContext.Provider value={value}>
      {children}
    </PatientClinicalSummaryContext.Provider>
  );
}

/** Doctor-only header action — place beside Schedule Appointment. */
export function PatientClinicalSummaryHeaderButton({
  className,
}: {
  className?: string;
}) {
  const { isLoading, hasNotes, isPending, summary, generate } =
    usePatientClinicalSummaryContext();

  if (isLoading && !summary) {
    return null;
  }

  const hasSaved = Boolean(summary);

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        'h-12 w-full min-w-0 rounded-full border-brand-blue px-4 text-brand-blue hover:bg-brand-blue/5 hover:text-brand-blue sm:w-auto',
        className
      )}
      disabled={!hasNotes || isPending}
      title={
        hasNotes
          ? hasSaved
            ? 'Regenerate AI overview from latest SOAP notes'
            : 'Generate an AI overview of this patient’s SOAP notes'
          : 'No SOAP notes yet'
      }
      onClick={() => void generate(hasSaved)}
    >
      {isPending ? <Spinner /> : <Sparkles className="mr-2 h-4 w-4 shrink-0" />}
      <span className="truncate text-sm font-medium">
        {hasSaved ? 'Regenerate summary' : 'Patient summary'}
      </span>
    </Button>
  );
}

/** Result panel above appointments for pre-visit reading. */
export function PatientClinicalSummaryPanel({
  className,
}: {
  className?: string;
}) {
  const { isLoading, hasNotes, isPending, summary, generatedAt, generate } =
    usePatientClinicalSummaryContext();

  if ((isLoading && !summary) || (!summary && !isPending)) {
    return null;
  }

  return (
    <AiSummaryPanel
      className={className}
      title="Patient summary"
      description="Saved AI overview of this patient’s SOAP notes. Doctor-only — regenerate only when you need a fresh draft."
      summary={summary}
      generatedAt={generatedAt}
      isPending={isPending}
      canGenerate={hasNotes}
      emptyMessage="No SOAP notes yet. Summaries become available after consultations are documented."
      onGenerate={() => void generate(Boolean(summary))}
    />
  );
}

/** @deprecated Prefer Provider + HeaderButton + Panel */
export default function PatientClinicalSummaryCard({
  patientId,
}: {
  patientId: string;
}) {
  return (
    <PatientClinicalSummaryProvider patientId={patientId}>
      <PatientClinicalSummaryPanel />
    </PatientClinicalSummaryProvider>
  );
}
