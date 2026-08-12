import type { RawRecordEntry, DeviceResultEvent } from '../types';
import { NativeDevice } from './base';
import WeightScaleSvg from '@/assets/icons/weight-scale-svg';

const DEVICE_IDENTIFIER = 'TNG SCALE';
const DEVICE_RESULT_IDENTIFIER = DEVICE_IDENTIFIER.replace(/\s+/g, '');

export type WeightScaleReading = {
  recordedAt: string;
  weightKg: number;
  weightLbs: number;
  bmi: number;
  bodyFat: number;
  basalMetabolicRate: number;
};

class WeightScaleDevice extends NativeDevice<WeightScaleReading> {
  readonly slug = 'weight-scale';
  readonly name = 'Weight Scale';
  readonly identifier = DEVICE_IDENTIFIER;
  readonly icon = WeightScaleSvg;

  protected parseRecord(entry: RawRecordEntry): WeightScaleReading | null {
    if (entry.weightKg == null) return null;
    return {
      recordedAt: entry.recordedAt,
      weightKg: entry.weightKg as number,
      weightLbs: entry.weightLbs as number,
      bmi: (entry.bmi as number) ?? 0,
      bodyFat: (entry.bodyFat as number) ?? 0,
      basalMetabolicRate: (entry.basalMetabolicRate as number) ?? 0,
    };
  }
}

export const WeightScale = new WeightScaleDevice();

export const weightScaleMock: DeviceResultEvent = {
  id: `devices.result.${DEVICE_RESULT_IDENTIFIER}`,
  deviceId: 'mock-weight-scale',
  identifier: DEVICE_RESULT_IDENTIFIER,
  date: '2026-02-06T12:00:00.000Z',
  data: [
    {
      recordedAt: '2026-02-06T12:00:00.000Z',
      weightKg: 70.5,
      weightLbs: 155.4,
      bmi: 23.1,
      bodyFat: 18.5,
      basalMetabolicRate: 1650,
    },
  ],
};
