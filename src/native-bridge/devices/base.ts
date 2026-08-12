import type {
  RawRecordEntry,
  DeviceResultEvent,
  DeviceReadingSource,
} from '../types';
import { subscribe } from '../bridge';

function normalizeIdentifier(value: string): string {
  return value.replace(/ /g, '');
}

export abstract class NativeDevice<TReading> {
  abstract readonly slug: string;
  abstract readonly name: string;
  abstract readonly identifier: string;
  abstract readonly icon: React.ComponentType;

  private _readings: TReading[] = [];
  private _sourcesByDeviceId: Record<string, DeviceReadingSource> = {};

  get readings(): readonly TReading[] {
    return this._readings;
  }

  get lastReading(): TReading | undefined {
    return this._readings[this._readings.length - 1];
  }

  get sources(): readonly DeviceReadingSource[] {
    return Object.values(this._sourcesByDeviceId);
  }

  getSource(deviceId: string): DeviceReadingSource | undefined {
    return this._sourcesByDeviceId[deviceId];
  }

  clearReadings(): void {
    this._readings = [];
    this._sourcesByDeviceId = {};
  }

  onReading(
    callback: (reading: TReading, source: DeviceReadingSource) => void
  ): () => void {
    return subscribe((msg) => {
      if (!msg.id?.startsWith('devices.result.')) return;
      const event = msg as DeviceResultEvent;
      if (
        normalizeIdentifier(event.identifier) !==
        normalizeIdentifier(this.identifier)
      )
        return;
      const source: DeviceReadingSource = {
        eventId: event.id,
        eventIdentifier: event.identifier,
        eventDate: event.date,
        deviceId: event.deviceId,
      };
      if (event.mac != null) {
        source.mac = event.mac;
      }
      if (event.meterName != null) {
        source.meterName = event.meterName;
      }
      this._sourcesByDeviceId[source.deviceId] = source;
      for (const entry of event.data) {
        const parsed = this.parseRecord(entry);
        if (parsed) {
          this._readings.push(parsed);
          callback(parsed, source);
        }
      }
    });
  }

  protected abstract parseRecord(entry: RawRecordEntry): TReading | null;
}
