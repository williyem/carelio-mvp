import type { RawRecordEntry, DeviceResultEvent } from '../types';
import { NativeDevice } from './base';
import GlucoseMeterSvg from '@/assets/icons/glucose-meter-svg';

const DEVICE_IDENTIFIER = 'FORA MD';
const DEVICE_RESULT_IDENTIFIER = DEVICE_IDENTIFIER.replace(/\s+/g, '');

export type GlucoseReading = {
  recordedAt: string;
  value: number;
  type: number;
  subType: number;
  subValue: number;
};

class GlucoseDevice extends NativeDevice<GlucoseReading> {
  readonly slug = 'glucose';
  readonly name = 'Blood Glucose Monitor';
  readonly identifier = DEVICE_IDENTIFIER;
  readonly icon = GlucoseMeterSvg;

  protected parseRecord(entry: RawRecordEntry): GlucoseReading | null {
    if (entry.value == null) return null;
    return {
      recordedAt: entry.recordedAt,
      value: entry.value as number,
      type: (entry.type as number) ?? 0,
      subType: (entry.subType as number) ?? 0,
      subValue: (entry.subValue as number) ?? 0,
    };
  }
}

export const Glucose = new GlucoseDevice();

export const glucoseMock: DeviceResultEvent = {
  id: `devices.result.${DEVICE_RESULT_IDENTIFIER}`,
  deviceId: 'mock-glucose',
  identifier: DEVICE_RESULT_IDENTIFIER,
  date: '2026-02-06T12:00:00.000Z',
  data: [
    {
      recordedAt: '2026-02-06T12:00:00.000Z',
      value: 95,
      type: 0,
      subType: 0,
      subValue: 0,
    },
  ],
};
