'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { DEVICE_GUIDES } from '@/lib/device-guides';
import {
  useAddManualMeasurementRequests,
  useMeasurementRequests,
} from '@/integration/clinical-intelligence';
import { toast } from 'sonner';

export default function MeasurementRequestPanel({
  appointmentId,
}: {
  appointmentId?: string;
}) {
  const { data, isLoading } = useMeasurementRequests(
    appointmentId,
    !!appointmentId
  );
  const addManual = useAddManualMeasurementRequests(appointmentId);

  const active =
    data?.requests.filter((item) =>
      ['requested', 'acknowledged', 'no_device', 'completed'].includes(
        item.status
      )
    ) ?? [];

  const handleRequest = async (
    vitalType: (typeof DEVICE_GUIDES)[number]['slug']
  ) => {
    try {
      await addManual.mutateAsync([vitalType]);
      const label =
        DEVICE_GUIDES.find((guide) => guide.slug === vitalType)?.shortLabel ||
        vitalType;
      toast.success(`Asked the patient to record ${label.toLowerCase()}`);
    } catch {
      toast.error('Could not send measurement request');
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
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-gray-900">Request a measurement</h3>
        <p className="text-sm text-(--text-secondary) mt-1">
          The patient or health assistant will see how to use the device and can
          record the reading.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {DEVICE_GUIDES.map((item) => {
          const pending = active.find(
            (request) =>
              request.vitalType === item.slug &&
              ['requested', 'acknowledged'].includes(request.status)
          );
          return (
            <div
              key={item.slug}
              className="flex items-center gap-3 rounded-[10px] border border-[#EBEBEB] p-3"
            >
              <div className="relative w-14 h-14 rounded-[8px] overflow-hidden bg-gray-100 shrink-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">
                  {item.shortLabel}
                </p>
                <p className="text-xs text-(--text-secondary) truncate">
                  {item.title}
                </p>
              </div>
              <Button
                type="button"
                variant={pending ? 'outline' : 'brand'}
                className="h-9 rounded-full px-4 shrink-0"
                disabled={addManual.isPending || !!pending}
                onClick={() => void handleRequest(item.slug)}
              >
                {pending ? 'Requested' : 'Request'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
