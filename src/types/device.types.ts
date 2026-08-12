export type DeviceStatus = 'connected' | 'disconnected';

export type DeviceType = 'known' | 'unknown';

export interface Device {
  id: string;
  name: string;
  status: DeviceStatus;
  type: DeviceType;
  icon?: React.ReactNode;
  lastReading?: {
    value: string;
    timestamp: string;
  };
}
