'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Bluetooth, Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVideoCallStore } from '@/stores/video-call-store';
import { useDeviceStore } from '@/stores/device-store';
import { useVitalsSync } from '@/hooks/page-hooks/video-call/useVitalsSync';
import { useCallVitalsStore, type CallVital } from '@/stores/call-vitals-store';
import useVitalsMutations from '@/integration/vitals/mutations';
import useDeviceConnection from '@/hooks/page-hooks/video-call/useDeviceConnection';
import {
  guideImage,
  toYouTubeEmbedUrl,
  type DeviceGuideSlug,
} from '@/lib/device-guides';
import { useDeviceGuides, useDeviceGuide } from '@/hooks/use-device-guides';
import { toast } from 'sonner';

const EMPTY_VITALS: CallVital[] = [];

const MANUAL_TYPES = [
  { value: 'blood-pressure', label: 'Blood pressure' },
  { value: 'pulse-ox', label: 'Heart rate / SpO2' },
  { value: 'thermometer', label: 'Temperature' },
  { value: 'weight-scale', label: 'Weight' },
  { value: 'glucose', label: 'Glucose' },
] as const;

type PanelStep = 'idle' | 'pick' | 'tutorial' | 'capture' | 'manual';

function resolvePatientId() {
  const state = useVideoCallStore.getState();
  return (
    state.selectedPatient?.id ||
    state.selectedAppointment?.patient?.id ||
    state.selectedAppointment?.patientId ||
    ''
  );
}

const DeviceCapturePanel = ({
  lockedSlug,
  onRecorded,
}: {
  lockedSlug?: DeviceGuideSlug;
  onRecorded?: () => void;
} = {}) => {
  const { selectedAppointment } = useVideoCallStore();
  const appointmentId = selectedAppointment?.id;
  const liveReadings = useDeviceStore((s) => s.liveReadings);
  const { syncReading } = useVitalsSync();
  const storedVitals = useCallVitalsStore((s) =>
    appointmentId ? s.byAppointmentId[appointmentId] : undefined
  );
  const callVitals = storedVitals ?? EMPTY_VITALS;
  const addVital = useCallVitalsStore((s) => s.addVital);
  const setStatus = useCallVitalsStore((s) => s.setStatus);
  const { confirmVitalsMutation, createVitalMutation } = useVitalsMutations();
  const { startListening, stopListening, reset } = useDeviceConnection();

  const { data: guides } = useDeviceGuides();
  const [step, setStep] = useState<PanelStep>(lockedSlug ? 'tutorial' : 'idle');
  const [selectedSlug, setSelectedSlug] = useState<DeviceGuideSlug | null>(
    lockedSlug ?? null
  );
  const [type, setType] = useState<(typeof MANUAL_TYPES)[number]['value']>(
    lockedSlug && MANUAL_TYPES.some((item) => item.value === lockedSlug)
      ? (lockedSlug as (typeof MANUAL_TYPES)[number]['value'])
      : 'blood-pressure'
  );
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [videoFailed, setVideoFailed] = useState(false);

  const syncedKeysRef = useRef<Set<string>>(new Set());
  const guide = useDeviceGuide(selectedSlug);

  const pending = useMemo(
    () => callVitals.filter((vital) => vital.status === 'pending'),
    [callVitals]
  );
  const confirmed = useMemo(
    () => callVitals.filter((vital) => vital.status === 'confirmed'),
    [callVitals]
  );

  useEffect(() => {
    if (step !== 'capture' || !appointmentId || !selectedSlug) return;

    Object.entries(liveReadings).forEach(([slug, reading]) => {
      if (slug !== selectedSlug) return;
      const key = `${slug}-${reading.value}-${reading.timestamp}`;
      if (syncedKeysRef.current.has(key)) return;
      syncedKeysRef.current.add(key);
      addVital(appointmentId, {
        appointmentId,
        type: slug,
        label:
          guides.find((item) => item.slug === slug)?.shortLabel ||
          slug.replace('-', ' '),
        value: reading.value,
        source: 'device',
        status: 'pending',
        recordedAt: reading.timestamp,
      });
      void syncReading(slug, reading.raw ?? { value: reading.value });
      toast.success('Device reading received');
    });
  }, [
    addVital,
    appointmentId,
    guides,
    liveReadings,
    selectedSlug,
    step,
    syncReading,
  ]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  const goIdle = () => {
    stopListening();
    reset();
    setStep('idle');
    setSelectedSlug(null);
    setVideoFailed(false);
  };

  const beginCapture = async () => {
    setStep('capture');
    await startListening();
    toast.message('Listening for device reading…');
  };

  const openManual = (slug?: DeviceGuideSlug) => {
    if (slug) {
      setSelectedSlug(slug);
      const match = MANUAL_TYPES.find((item) => item.value === slug);
      if (match) setType(match.value);
    }
    setStep('manual');
  };

  const handleManualSave = async () => {
    if (!appointmentId || !value.trim()) {
      toast.error('Enter a reading first');
      return;
    }
    const display = note ? `${value} (${note})` : value;
    addVital(appointmentId, {
      appointmentId,
      type,
      label: MANUAL_TYPES.find((item) => item.value === type)?.label || type,
      value: display,
      source: 'manual',
      status: 'confirmed',
      recordedAt: new Date().toISOString(),
    });
    try {
      await createVitalMutation.mutateAsync({
        appointmentId,
        patientId: resolvePatientId(),
        vitalType: type,
        reading: { value, note, source: 'manual' },
        recordedAt: new Date().toISOString(),
      });
    } catch {
      // local store already has it
    }
    toast.success('Vital recorded and confirmed');
    setValue('');
    setNote('');
    onRecorded?.();
    if (lockedSlug) {
      setStep('tutorial');
    } else {
      setStep('idle');
    }
  };

  const handleConfirm = async (vitalId: string) => {
    if (!appointmentId) return;
    setStatus(appointmentId, vitalId, 'confirmed');
    try {
      await confirmVitalsMutation.mutateAsync({
        appointmentId,
        data: { vitalIds: [vitalId] },
      });
    } catch {
      // keep local confirmed status
    }
    toast.success('Vital confirmed');
    onRecorded?.();
  };

  const handleDiscard = (vitalId: string) => {
    if (!appointmentId) return;
    setStatus(appointmentId, vitalId, 'discarded');
    toast.message('Vital discarded');
  };

  return (
    <Card
      className={
        lockedSlug
          ? 'border-0 shadow-none bg-transparent'
          : 'border-(--border-stroke) shadow-none rounded-[14px] overflow-hidden bg-(--bg-white) h-fit'
      }
    >
      <CardContent
        className={lockedSlug ? 'p-0 space-y-6' : 'p-6 sm:p-8 space-y-6'}
      >
        {step !== 'idle' && !lockedSlug && (
          <button
            type="button"
            onClick={() => {
              if (step === 'pick') goIdle();
              else if (step === 'tutorial') setStep('pick');
              else if (step === 'capture' || step === 'manual')
                setStep(guide ? 'tutorial' : 'pick');
            }}
            className="flex items-center gap-1 text-sm text-(--text-muted) hover:text-(--text-primary)"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}

        {step === 'idle' && !lockedSlug && (
          <>
            <div className="space-y-2">
              <h3 className="font-bold text-brand-blue">Vitals capture</h3>
              <p className="text-sm text-(--text-secondary)">
                Connect an approved device, watch a short how-to, then capture a
                reading—or enter one manually from what you see on screen.
              </p>
            </div>
            <Button
              type="button"
              variant="brand"
              className="w-full h-11 rounded-[8px] gap-2"
              onClick={() => setStep('pick')}
            >
              <Bluetooth className="w-4 h-4" />
              Connect device
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 rounded-[8px]"
              onClick={() => openManual()}
            >
              Record manually
            </Button>
          </>
        )}

        {step === 'pick' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-(--text-primary)">
                Choose a device
              </h3>
              <p className="text-sm text-(--text-secondary) mt-1">
                Pick the device you will use for this reading.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {guides.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => {
                    setSelectedSlug(item.slug);
                    setVideoFailed(false);
                    setStep('tutorial');
                  }}
                  className="flex items-center gap-3 rounded-[10px] border border-(--border-stroke) p-3 text-left hover:border-brand-blue/40 hover:bg-(--bg-primary) transition-colors"
                >
                  <div className="relative w-16 h-16 rounded-[8px] overflow-hidden bg-(--bg-light-gray) shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={guideImage(item)}
                      alt={item.title}
                      className="size-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-(--text-primary)">
                      {item.title}
                    </p>
                    <p className="text-xs text-(--text-secondary)">
                      {item.shortLabel}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'tutorial' && guide && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-(--text-primary)">{guide.title}</h3>
              <p className="text-sm text-(--text-secondary) mt-1">
                {guide.description}
              </p>
            </div>

            <div className="relative w-full aspect-video rounded-[10px] overflow-hidden bg-(--bg-light-gray) border border-(--border-stroke)">
              {toYouTubeEmbedUrl(guide.youtubeUrl) ? (
                <iframe
                  title={`${guide.title} how-to`}
                  src={toYouTubeEmbedUrl(guide.youtubeUrl) || undefined}
                  className="size-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : !videoFailed && guide.video ? (
                <video
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  poster={guideImage(guide)}
                  onError={() => setVideoFailed(true)}
                >
                  <source src={guide.video} type="video/mp4" />
                </video>
              ) : (
                <div className="relative w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={guideImage(guide)}
                    alt={`${guide.title} reference`}
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-xs px-3 py-2 flex items-center gap-2">
                    <Video className="w-3.5 h-3.5" />
                    Add a YouTube how-to in Admin → Devices, or a local demo
                    video.
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">How to use</p>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-(--text-secondary)">
                {guide.steps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>

            {guide.tips.length > 0 && (
              <div className="rounded-[8px] bg-(--bg-primary) p-3 space-y-1">
                <p className="text-xs font-semibold text-(--text-primary)">
                  Tips
                </p>
                {guide.tips.map((tip) => (
                  <p key={tip} className="text-xs text-(--text-secondary)">
                    {tip}
                  </p>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="brand"
                className="w-full h-11 rounded-[8px]"
                onClick={() => void beginCapture()}
              >
                Start recording from device
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-[8px]"
                onClick={() => openManual(guide.slug)}
              >
                Enter manually instead
              </Button>
            </div>
          </div>
        )}

        {step === 'capture' && guide && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-(--text-primary)">Listening…</h3>
              <p className="text-sm text-(--text-secondary) mt-1">
                Use the {guide.title.toLowerCase()} as shown in the tutorial.
                New readings appear below for confirmation.
              </p>
            </div>
            <div className="relative w-full h-36 rounded-[10px] overflow-hidden bg-(--bg-light-gray)">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={guideImage(guide)}
                alt={guide.title}
                className="size-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2 bg-state-success-lighter h-[34px] px-2.5 rounded-full w-fit">
              <div className="w-[10px] h-[10px] rounded-full bg-[#0B7E17] animate-pulse" />
              <span className="text-(--text-green-dark) text-xs font-normal">
                Waiting for {guide.shortLabel.toLowerCase()} reading
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 rounded-[8px]"
              onClick={() => openManual(guide.slug)}
            >
              Enter manually instead
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 rounded-[8px]"
              onClick={goIdle}
            >
              Disconnect
            </Button>
          </div>
        )}

        {step === 'manual' && (
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-(--text-primary)">
                Record manually
              </h3>
              <p className="text-xs text-(--text-secondary) mt-1">
                Type the reading shown on the patient&apos;s device or screen.
                Manual entries are confirmed immediately.
              </p>
            </div>
            <Label>Type</Label>
            <select
              className="h-10 w-full rounded-md border border-(--border-stroke) px-3 text-sm"
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value as (typeof MANUAL_TYPES)[number]['value']
                )
              }
            >
              {MANUAL_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <Label>Reading</Label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 120/80 or 98.6°F"
              className="h-10"
            />
            <Label>Note (optional)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Shown on patient device"
              className="h-10"
            />
            <Button
              type="button"
              variant="brand"
              className="rounded-[8px] w-full h-11"
              onClick={() => void handleManualSave()}
            >
              Save confirmed vital
            </Button>
          </div>
        )}

        {pending.length > 0 && (
          <div className="space-y-3 border-t border-(--border-stroke) pt-4">
            <p className="text-sm font-semibold">Pending device readings</p>
            {pending.map((vital) => (
              <div
                key={vital.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span>
                  {vital.label}: <strong>{vital.value}</strong>
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="brand"
                    className="h-8 rounded-full"
                    onClick={() => void handleConfirm(vital.id)}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-full"
                    onClick={() => handleDiscard(vital.id)}
                  >
                    Discard
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {confirmed.length > 0 && (
          <div className="space-y-2 border-t border-(--border-stroke) pt-4">
            <p className="text-sm font-semibold">Confirmed this visit</p>
            {confirmed.map((vital) => (
              <p key={vital.id} className="text-sm text-(--text-secondary)">
                {vital.label}: {vital.value}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceCapturePanel;
