import type { RawRecordEntry } from '../types';
import { NativeDevice } from './base';
import { ScanLine } from 'lucide-react';

const DEVICE_IDENTIFIER = ''; // TBD — update after testing with Dino-Lite

export type MicroscopeReading = {
  recordedAt: string;
  raw?: string;
};

class MicroscopeDevice extends NativeDevice<MicroscopeReading> {
  readonly slug = 'microscope';
  readonly name = 'Digital Microscope';
  readonly identifier = DEVICE_IDENTIFIER;
  readonly icon = ScanLine;

  protected parseRecord(entry: RawRecordEntry): MicroscopeReading | null {
    return {
      recordedAt: entry.recordedAt,
      raw: entry.raw as string | undefined,
    };
  }
}

export const Microscope = new MicroscopeDevice();
