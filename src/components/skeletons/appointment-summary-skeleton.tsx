import { Skeleton } from '@/components/ui/skeleton';

const soapBlocks = [
  { labelW: 140, lines: [220, 180, 260] },
  { labelW: 120, lines: [200, 240] },
  { labelW: 130, lines: [180, 220, 200] },
  { labelW: 100, lines: [160, 200] },
];

export function AppointmentSummarySkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Back link + page heading */}
      <div className="space-y-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-64" />
      </div>

      {/* HealthRecordRow card */}
      <div className="flex items-center justify-between w-full p-4 rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-4 flex-1">
          {/* Avatar */}
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="space-y-1.5">
            {/* Patient name */}
            <Skeleton className="h-5 w-40" />
            {/* Date + duration meta row */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
        {/* Document icon placeholder */}
        <Skeleton className="h-5 w-5 rounded" />
      </div>

      {/* Tabs bar – 5 pill tabs */}
      <div className="bg-[#F9F9F9] p-1 rounded-full flex gap-1 overflow-x-auto no-scrollbar">
        {['SOAP notes', 'Lab Results', 'Forms', 'HIE Records', 'Vitals'].map(
          (label) => (
            <Skeleton
              key={label}
              className="flex-1 h-10 rounded-full"
              style={{ minWidth: 72 }}
            />
          )
        )}
      </div>

      {/* Content area – mirrors the SOAP notes default tab */}
      <div className="space-y-6 min-h-[400px]">
        {/* Section label */}
        <Skeleton className="h-5 w-32" />

        {/* SOAP blocks: Subjective / Objective / Assessment / Plan */}
        {soapBlocks.map((block, i) => (
          <div key={i} className="space-y-2">
            <Skeleton style={{ height: 16, width: block.labelW }} />
            {block.lines.map((lw, j) => (
              <Skeleton key={j} style={{ height: 12, width: lw }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
