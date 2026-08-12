import type { RawRecordEntry } from '../types';
import { NativeDevice } from './base';
import StethoscopeSvg from '@/assets/icons/stethoscope-svg';

const DEVICE_IDENTIFIER = 'Lapsi Keikku c33636'; // TBD — update after testing with Keikku

export type StethoscopeReading = {
  recordedAt: string;
  raw?: string;
};

class StethoscopeDevice extends NativeDevice<StethoscopeReading> {
  readonly slug = 'stethoscope';
  readonly name = 'Stethoscope';
  readonly identifier = DEVICE_IDENTIFIER;
  readonly icon = StethoscopeSvg;

  protected parseRecord(entry: RawRecordEntry): StethoscopeReading | null {
    return {
      recordedAt: entry.recordedAt,
      raw: entry.raw as string | undefined,
    };
  }
}

export const Stethoscope = new StethoscopeDevice();
