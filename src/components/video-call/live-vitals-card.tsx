'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVideoCallStore } from '@/stores/video-call-store';
import { useLiveVitals } from '@/hooks/use-live-vitals';
import { useDeviceStore } from '@/stores/device-store';
import { useVitalsSync } from '@/hooks/page-hooks/video-call/useVitalsSync';
import { useCallVitalsStore } from '@/stores/call-vitals-store';
import useVitalsMutations from '@/integration/vitals/mutations';
import { toast } from 'sonner';

const MANUAL_TYPES = [
  { value: 'blood-pressure', label: 'Blood pressure' },
  { value: 'pulse-ox', label: 'Heart rate / SpO2' },
  { value: 'thermometer', label: 'Temperature' },
  { value: 'weight-scale', label: 'Weight' },
  { value: 'glucose', label: 'Glucose' },
] as const;

const LiveVitalsCard = () => {
  const { selectedAppointment } = useVideoCallStore();
  const appointmentId = selectedAppointment?.id;
  const { formattedVitals, isConnected } = useLiveVitals({
    appointmentId,
  });
  const liveReadings = useDeviceStore((s) => s.liveReadings);
  const { syncReading } = useVitalsSync();
  const callVitals = useCallVitalsStore((s) =>
    appointmentId ? (s.byAppointmentId[appointmentId] ?? []) : []
  );
  const addVital = useCallVitalsStore((s) => s.addVital);
  const setStatus = useCallVitalsStore((s) => s.setStatus);
  const { confirmVitalsMutation, createVitalMutation } = useVitalsMutations();

  const [type, setType] =
    useState<(typeof MANUAL_TYPES)[number]['value']>('blood-pressure');
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');

  const syncedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!appointmentId) return;
    Object.entries(liveReadings).forEach(([slug, reading]) => {
      const key = `${slug}-${reading.value}-${reading.timestamp}`;
      if (syncedKeysRef.current.has(key)) return;
      syncedKeysRef.current.add(key);
      addVital(appointmentId, {
        appointmentId,
        type: slug,
        label: slug.replace('-', ' '),
        value: reading.value,
        source: 'device',
        status: 'pending',
        recordedAt: reading.timestamp,
      });
      void syncReading(slug, reading.raw ?? { value: reading.value });
    });
  }, [addVital, appointmentId, liveReadings, syncReading]);

  const pending = useMemo(
    () => callVitals.filter((vital) => vital.status === 'pending'),
    [callVitals]
  );
  const confirmed = useMemo(
    () => callVitals.filter((vital) => vital.status === 'confirmed'),
    [callVitals]
  );

  const hasAnyVitals =
    formattedVitals.heartRate ||
    formattedVitals.bloodPressure ||
    formattedVitals.temperature ||
    formattedVitals.oxygenSaturation ||
    formattedVitals.weight ||
    formattedVitals.glucose ||
    confirmed.length > 0;

  const vitalsList = [
    { label: 'Heart Rate', value: formattedVitals.heartRate },
    { label: 'Blood Pressure', value: formattedVitals.bloodPressure },
    { label: 'Temperature', value: formattedVitals.temperature },
    { label: 'O₂ Saturation', value: formattedVitals.oxygenSaturation },
    { label: 'Weight', value: formattedVitals.weight },
    { label: 'Blood Glucose', value: formattedVitals.glucose },
  ];

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
        patientId: useVideoCallStore.getState().selectedPatient?.id || '',
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
  };

  const handleDiscard = (vitalId: string) => {
    if (!appointmentId) return;
    setStatus(appointmentId, vitalId, 'discarded');
    toast.message('Vital discarded');
  };

  return (
    <Card className="border-[#EBEBEB] shadow-none rounded-[14px] overflow-hidden bg-white h-fit">
      <CardContent className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-brand-blue">Live Vitals</h3>
          {hasAnyVitals || pending.length > 0 ? (
            <div className="flex items-center gap-2 bg-[#E7F7E9] justify-between h-[34px] px-2.5 rounded-full">
              <div className="w-[10px] h-[10px] rounded-full bg-[#0B7E17] animate-pulse" />
              <span className="text-[#096112] text-xs font-normal">
                {pending.length > 0 ? 'Needs confirmation' : 'Live Readings'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-gray-100 justify-between h-[34px] px-2.5 rounded-full">
              <div
                className={`w-[10px] h-[10px] rounded-full ${isConnected ? 'bg-yellow-500' : 'bg-gray-400'}`}
              />
              <span className="text-gray-500 text-xs font-normal">
                {isConnected ? 'Waiting...' : 'Connecting...'}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {vitalsList.map((vital, i) => (
            <div key={i} className="flex justify-between items-center group">
              <span className="font-normal text-(--text-secondary)">
                {vital.label}
              </span>
              <span
                className={`font-bold ${vital.value ? 'text-gray-900' : 'text-gray-400'}`}
              >
                {vital.value || 'N/A'}
              </span>
            </div>
          ))}
        </div>

        {pending.length > 0 && (
          <div className="space-y-3 border-t border-gray-100 pt-4">
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
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold">Confirmed this visit</p>
            {confirmed.map((vital) => (
              <p key={vital.id} className="text-sm text-(--text-secondary)">
                {vital.label}: {vital.value}
              </p>
            ))}
          </div>
        )}

        <div className="space-y-3 border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold">Enter vital from screen</p>
          <p className="text-xs text-(--text-secondary)">
            Type what the patient shows on camera. Doctor-entered readings are
            confirmed immediately.
          </p>
          <div className="space-y-2">
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
              className="rounded-full w-full"
              onClick={() => void handleManualSave()}
            >
              Save confirmed vital
            </Button>
          </div>
        </div>

        {formattedVitals.lastUpdated && (
          <div className="pt-4 border-t border-gray-100 flex justify-center">
            <p className="text-sm font-normal text-(--text-secondary)">
              Last updated: {formattedVitals.lastUpdated}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveVitalsCard;
