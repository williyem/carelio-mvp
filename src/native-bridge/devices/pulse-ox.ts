import type { RawRecordEntry, DeviceResultEvent } from '../types';
import { NativeDevice } from './base';
import PulseOxSvg from '@/assets/icons/pulse-ox-svg';

const DEVICE_IDENTIFIER = 'FORA PO100';
const DEVICE_RESULT_IDENTIFIER = DEVICE_IDENTIFIER.replace(/\s+/g, '');

export type PulseOxReading = {
  recordedAt: string;
  spo2: number;
  pulse: number;
  pi: number;
};

class PulseOxDevice extends NativeDevice<PulseOxReading> {
  readonly slug = 'pulse-ox';
  readonly name = 'Handheld Pulse Oximeter';
  readonly identifier = DEVICE_IDENTIFIER;
  readonly icon = PulseOxSvg;

  protected parseRecord(entry: RawRecordEntry): PulseOxReading | null {
    if (entry.spo2 == null) return null;
    return {
      recordedAt: entry.recordedAt,
      spo2: entry.spo2 as number,
      pulse: entry.pulse as number,
      pi: (entry.pi as number) ?? 0,
    };
  }
}

export const PulseOx = new PulseOxDevice();

export const pulseOxMock: DeviceResultEvent = {
  id: `devices.result.${DEVICE_RESULT_IDENTIFIER}`,
  deviceId: 'mock-pulse-ox',
  identifier: DEVICE_RESULT_IDENTIFIER,
  date: '2026-02-06T12:00:00.000Z',
  data: [
    { recordedAt: '2026-02-06T12:00:00.000Z', spo2: 98, pulse: 68, pi: 4.5 },
  ],
};
