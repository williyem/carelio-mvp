import type { RawRecordEntry, DeviceResultEvent } from '../types';
import { NativeDevice } from './base';
import ThermometerSvg from '@/assets/icons/thermometer-svg';

const DEVICE_IDENTIFIER = 'FORA IR20';
const DEVICE_RESULT_IDENTIFIER = DEVICE_IDENTIFIER.replace(/\s+/g, '');

export type ThermometerReading = {
  recordedAt: string;
  temperatureC: number;
  temperatureF: number;
  ambientC: number;
  ambientF: number;
};

class ThermometerDevice extends NativeDevice<ThermometerReading> {
  readonly slug = 'thermometer';
  readonly name = 'Ear Thermometer';
  readonly identifier = DEVICE_IDENTIFIER;
  readonly icon = ThermometerSvg;

  protected parseRecord(entry: RawRecordEntry): ThermometerReading | null {
    if (entry.temperatureC == null || entry.temperatureF == null) return null;
    return {
      recordedAt: entry.recordedAt,
      temperatureC: entry.temperatureC as number,
      temperatureF: entry.temperatureF as number,
      ambientC: (entry.ambientC as number) ?? 0,
      ambientF: (entry.ambientF as number) ?? 0,
    };
  }
}

export const Thermometer = new ThermometerDevice();

export const thermometerMock: DeviceResultEvent = {
  id: `devices.result.${DEVICE_RESULT_IDENTIFIER}`,
  deviceId: 'mock-thermometer',
  identifier: DEVICE_RESULT_IDENTIFIER,
  date: '2026-02-06T12:00:00.000Z',
  data: [
    {
      recordedAt: '2026-02-06T12:00:00.000Z',
      temperatureC: 37.0,
      temperatureF: 98.6,
      ambientC: 22.0,
      ambientF: 71.6,
    },
  ],
};
