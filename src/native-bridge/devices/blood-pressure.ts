import type { RawRecordEntry, DeviceResultEvent } from '../types';
import { NativeDevice } from './base';
import BloodPressureCuffSvg from '@/assets/icons/blood-pressure-cuff-svg';

const DEVICE_IDENTIFIER = 'FORA P20';
const DEVICE_RESULT_IDENTIFIER = DEVICE_IDENTIFIER.replace(/\s+/g, '');

export type BloodPressureReading = {
  recordedAt: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  irregularHeartbeat: boolean;
};

class BloodPressureDevice extends NativeDevice<BloodPressureReading> {
  readonly slug = 'blood-pressure';
  readonly name = 'Blood Pressure Monitor';
  readonly identifier = DEVICE_IDENTIFIER;
  readonly icon = BloodPressureCuffSvg;

  protected parseRecord(entry: RawRecordEntry): BloodPressureReading | null {
    if (entry.systolic == null) return null;
    return {
      recordedAt: entry.recordedAt,
      systolic: entry.systolic as number,
      diastolic: entry.diastolic as number,
      pulse: entry.pulse as number,
      irregularHeartbeat: (entry.irregularHeartbeat as boolean) ?? false,
    };
  }
}

export const BloodPressure = new BloodPressureDevice();

export const bloodPressureMock: DeviceResultEvent = {
  id: `devices.result.${DEVICE_RESULT_IDENTIFIER}`,
  deviceId: 'mock-blood-pressure',
  identifier: DEVICE_RESULT_IDENTIFIER,
  date: '2026-02-06T12:00:00.000Z',
  data: [
    {
      recordedAt: '2026-02-06T12:00:00.000Z',
      systolic: 120,
      diastolic: 80,
      pulse: 72,
      irregularHeartbeat: false,
    },
  ],
};
