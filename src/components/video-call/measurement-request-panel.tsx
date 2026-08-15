'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  guideImage,
  toYouTubeEmbedUrl,
  type DeviceGuideSlug,
} from '@/lib/device-guides';
import { MEASUREMENT_TYPES } from '@/lib/measurement-catalog';
import { useDeviceGuides } from '@/hooks/use-device-guides';
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
  const { data: guides } = useDeviceGuides();
  const { data, isLoading } = useMeasurementRequests(
    appointmentId,
    !!appointmentId
  );
  const addManual = useAddManualMeasurementRequests(appointmentId);
  const [howToSlug, setHowToSlug] = useState<string | null>(null);

  const active =
    data?.requests.filter((item) =>
      ['requested', 'acknowledged', 'no_device', 'completed'].includes(
        item.status
      )
    ) ?? [];

  const handleRequest = async (vitalType: DeviceGuideSlug) => {
    if (!(MEASUREMENT_TYPES as readonly string[]).includes(vitalType)) {
      toast.error('This device is guide-only and cannot be requested yet');
      return;
    }
    try {
      await addManual.mutateAsync([
        vitalType as (typeof MEASUREMENT_TYPES)[number],
      ]);
      const label =
        guides.find((guide) => guide.slug === vitalType)?.shortLabel ||
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
        <h3 className="font-bold text-(--text-primary)">
          Request a measurement
        </h3>
        <p className="text-sm text-(--text-secondary) mt-1">
          The patient or health assistant will see how to use the device and can
          record the reading.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {guides.map((item) => {
          const pending = active.find(
            (request) =>
              request.vitalType === item.slug &&
              ['requested', 'acknowledged'].includes(request.status)
          );
          const open = howToSlug === item.slug;
          const embed = toYouTubeEmbedUrl(item.youtubeUrl);
          return (
            <div
              key={item.slug}
              className="rounded-[10px] border border-(--border-stroke) p-3 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-[8px] overflow-hidden bg-(--bg-light-gray) shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={guideImage(item)}
                    alt={item.title}
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-(--text-primary)">
                    {item.shortLabel}
                  </p>
                  <p className="text-xs text-(--text-secondary) truncate">
                    {item.title}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0 items-end">
                  {(MEASUREMENT_TYPES as readonly string[]).includes(
                    item.slug
                  ) ? (
                    <Button
                      type="button"
                      variant={pending ? 'outline' : 'brand'}
                      className="h-9 rounded-full px-4"
                      disabled={addManual.isPending || !!pending}
                      onClick={() => void handleRequest(item.slug)}
                    >
                      {pending ? 'Requested' : 'Request'}
                    </Button>
                  ) : (
                    <span className="text-xs text-(--text-secondary) px-1">
                      Guide only
                    </span>
                  )}
                  <button
                    type="button"
                    className="text-xs text-brand-blue hover:underline"
                    onClick={() => setHowToSlug(open ? null : item.slug)}
                  >
                    {open ? 'Hide how-to' : 'How to use'}
                  </button>
                </div>
              </div>
              {open ? (
                <div className="space-y-2 border-t border-(--border-stroke) pt-3">
                  {embed ? (
                    <div className="aspect-video w-full overflow-hidden rounded-[8px] bg-black">
                      <iframe
                        title={`${item.title} how-to`}
                        src={embed}
                        className="size-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : item.youtubeUrl ? (
                    <a
                      href={item.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-brand-blue"
                    >
                      <ExternalLink className="size-3.5" />
                      Open YouTube
                    </a>
                  ) : null}
                  <ol className="list-decimal pl-4 space-y-1 text-sm text-(--text-secondary)">
                    {item.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
