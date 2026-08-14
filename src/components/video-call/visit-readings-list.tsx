'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  useGetVitalsByAppointmentQuery,
  useRejectVitals,
} from '@/integration/vitals';
import { formatVitalValue } from '@/lib/easy';
import { getDeviceGuide } from '@/lib/device-guides';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function VisitReadingsList({
  appointmentId,
  canReject = false,
}: {
  appointmentId?: string;
  canReject?: boolean;
}) {
  const { data, isLoading } = useGetVitalsByAppointmentQuery(
    appointmentId || '',
    { refetchInterval: appointmentId ? 2000 : false }
  );
  const reject = useRejectVitals(appointmentId);

  const readings = (data || []).filter((vital) => vital.status !== 'discarded');
  const rejected = (data || []).filter((vital) => vital.status === 'discarded');

  const handleReject = async (vitalId: string) => {
    try {
      await reject.mutateAsync([vitalId]);
      toast.success('Reading rejected');
    } catch {
      toast.error('Could not reject reading');
    }
  };

  if (!appointmentId) return null;

  if (isLoading && !data) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  if (readings.length === 0 && rejected.length === 0) {
    return (
      <p className="text-sm text-(--text-secondary) rounded-[10px] bg-[#F7F9FC] p-4">
        No readings recorded for this visit yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {readings.map((vital) => {
        const label =
          getDeviceGuide(vital.vitalType)?.shortLabel || vital.vitalType;
        const confirmed = vital.status === 'confirmed';
        return (
          <div
            key={vital.id}
            className="rounded-[10px] border border-[#EBEBEB] p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm text-gray-900">{label}</p>
                <p className="text-base font-bold text-gray-900 mt-0.5">
                  {formatVitalValue(vital)}
                </p>
              </div>
              <span
                className={cn(
                  'text-xs rounded-full px-2 py-0.5 shrink-0',
                  confirmed
                    ? 'bg-green-50 text-green-700'
                    : 'bg-blue-50 text-brand-blue'
                )}
              >
                {confirmed ? 'Confirmed' : 'Pending'}
              </span>
            </div>
            {canReject && confirmed ? (
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-full text-xs"
                disabled={reject.isPending}
                onClick={() => void handleReject(vital.id)}
              >
                Reject
              </Button>
            ) : null}
          </div>
        );
      })}

      {rejected.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-semibold text-(--text-secondary)">
            Rejected
          </p>
          {rejected.map((vital) => {
            const label =
              getDeviceGuide(vital.vitalType)?.shortLabel || vital.vitalType;
            return (
              <div
                key={vital.id}
                className="flex items-center justify-between gap-2 text-sm text-(--text-secondary)"
              >
                <span>
                  {label}: {formatVitalValue(vital)}
                </span>
                <span className="text-xs rounded-full px-2 py-0.5 bg-red-50 text-red-700">
                  Rejected
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
