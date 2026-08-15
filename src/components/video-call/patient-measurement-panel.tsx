'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  useMeasurementRequests,
  useRespondToMeasurementRequest,
} from '@/integration/clinical-intelligence';
import { getDeviceGuide, type DeviceGuideSlug } from '@/lib/device-guides';
import { useDeviceGuide } from '@/hooks/use-device-guides';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import DeviceCapturePanel from './device-capture-panel';
import VisitReadingsList from './visit-readings-list';
import { EmptyState } from '@/components/ui/empty-state';

export default function PatientMeasurementPanel({
  appointmentId,
}: {
  appointmentId?: string;
}) {
  const { data, isLoading } = useMeasurementRequests(
    appointmentId,
    !!appointmentId
  );
  const respond = useRespondToMeasurementRequest(appointmentId);
  const notifiedIdsRef = useRef<Set<string> | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const requested =
    data?.requests.filter((item) =>
      ['requested', 'acknowledged'].includes(item.status)
    ) ?? [];
  const other =
    data?.requests.filter((item) =>
      ['no_device', 'completed'].includes(item.status)
    ) ?? [];

  const openKey = requested.map((item) => item.id).join(',');
  const [trackedKey, setTrackedKey] = useState(openKey);

  if (openKey !== trackedKey) {
    const prevIds = trackedKey.split(',').filter(Boolean);
    const newest = requested.find((item) => !prevIds.includes(item.id));
    setTrackedKey(openKey);
    if (newest) setSelectedId(newest.id);
  }

  const active =
    requested.find((item) => item.id === selectedId) ?? requested[0];

  const guideFromStore = useDeviceGuide(active?.vitalType);
  const guide =
    guideFromStore || (active ? getDeviceGuide(active.vitalType) : undefined);

  useEffect(() => {
    if (!data) return;

    const open = data.requests.filter((item) =>
      ['requested', 'acknowledged'].includes(item.status)
    );
    const ids = open.map((item) => item.id);

    if (notifiedIdsRef.current === null) {
      notifiedIdsRef.current = new Set(ids);
      return;
    }

    const newest = open.find((item) => !notifiedIdsRef.current?.has(item.id));
    notifiedIdsRef.current = new Set(ids);

    if (newest) {
      toast.message(`Please record ${newest.label.toLowerCase()}`);
    }
  }, [data]);

  const handleNoDevice = async (requestId: string) => {
    try {
      await respond.mutateAsync({ requestId, status: 'no_device' });
      toast.message('Clinician notified you do not have this device');
    } catch {
      toast.error('Could not send response');
    }
  };

  const handleRecorded = async () => {
    if (!active) return;
    try {
      await respond.mutateAsync({ requestId: active.id, status: 'completed' });
    } catch {
      // Reading is already saved; status update is secondary
    }
  };

  if (!appointmentId) return null;

  if (isLoading && !data) {
    return (
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-(--text-primary)">
          Requested measurements
        </h3>
        <p className="text-sm text-(--text-secondary) mt-1">
          When the doctor asks for a reading, it appears here with a photo and
          steps for the device.
        </p>
      </div>

      {requested.length === 0 && other.length === 0 ? (
        <EmptyState
          className="py-6"
          title="No measurements requested yet"
          description="When the doctor asks for a reading, it will show up here with device steps."
        />
      ) : null}

      {requested.length > 1 && (
        <div className="flex flex-col gap-2">
          {requested.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={cn(
                'text-left rounded-[10px] border px-3 py-2 text-sm',
                item.id === active?.id
                  ? 'border-brand-blue bg-blue-50/50'
                  : 'border-(--border-stroke) bg-(--bg-white)'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className="rounded-[14px] border border-brand-blue/30 bg-(--bg-white) p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
              Record now
            </p>
            <h4 className="font-bold text-(--text-primary) mt-1">
              {guide?.title || active.label}
            </h4>
          </div>

          <DeviceCapturePanel
            key={active.id}
            lockedSlug={(guide?.slug || active.vitalType) as DeviceGuideSlug}
            onRecorded={() => void handleRecorded()}
          />

          <Button
            type="button"
            variant="outline"
            className="w-full h-10 rounded-[8px]"
            disabled={respond.isPending}
            onClick={() => void handleNoDevice(active.id)}
          >
            I don&apos;t have this device
          </Button>
        </div>
      )}

      <div className="space-y-3 border-t border-(--border-stroke) pt-4">
        <div>
          <h3 className="font-bold text-(--text-primary)">
            Recorded this visit
          </h3>
          <p className="text-sm text-(--text-secondary) mt-1">
            Readings are confirmed when you save them. The doctor can reject a
            reading if it looks wrong.
          </p>
        </div>
        <VisitReadingsList appointmentId={appointmentId} />
      </div>
    </div>
  );
}
