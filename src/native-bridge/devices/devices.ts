import { send, subscribe } from '../bridge';
import type {
  DeviceCatalogStateEvent,
  DeviceListenStateEvent,
  DeviceResultEvent,
} from '../types';
import type { NativeDevice } from './base';

export const Devices = {
  startListening(options?: {
    interval?: number;
    models?: NativeDevice<unknown>[];
  }): void {
    const { models, ...rest } = options ?? {};
    send({
      id: 'devices.listen.start',
      ...rest,
      ...(models ? { models: models.map((device) => device.identifier) } : {}),
    });
  },

  stopListening(): void {
    send({ id: 'devices.listen.stop' });
  },

  connect(deviceId: string): void {
    send({ id: 'devices.connect', deviceId });
  },

  onListenState(callback: (event: DeviceListenStateEvent) => void): () => void {
    return subscribe((msg) => {
      if (msg.id === 'devices.state.listen')
        callback(msg as DeviceListenStateEvent);
    });
  },

  onCatalogState(
    callback: (event: DeviceCatalogStateEvent) => void
  ): () => void {
    return subscribe((msg) => {
      if (msg.id === 'devices.state.catalog')
        callback(msg as DeviceCatalogStateEvent);
    });
  },

  onResult(callback: (event: DeviceResultEvent) => void): () => void {
    return subscribe((msg) => {
      if (msg.id.startsWith('devices.result.'))
        callback(msg as DeviceResultEvent);
    });
  },
};
