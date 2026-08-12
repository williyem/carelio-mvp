export type DeviceSlug =
  | 'thermometer'
  | 'pulse-ox'
  | 'blood-pressure'
  | 'glucose'
  | 'weight-scale'
  | 'stethoscope'
  | 'microscope';

export type DeviceOwnerType = 'health_assistant' | 'doctor';

export type DeviceStatus = 'active' | 'inactive' | 'disconnected';

export interface Device {
  id: string;
  slug: DeviceSlug;
  name: string;
  identifier: string;
  macAddress?: string;
  ownerId: string;
  ownerType: DeviceOwnerType;
  isKnown: boolean;
  status: DeviceStatus;
  lastConnectedAt?: string;
  lastReadingAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeviceRequest {
  slug: DeviceSlug;
  name: string;
  identifier: string;
  macAddress?: string;
  isKnown?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateDeviceRequest {
  name?: string;
  isKnown?: boolean;
  status?: DeviceStatus;
  metadata?: Record<string, unknown>;
}

export interface ConnectDeviceRequest {
  macAddress?: string;
}

export type DevicesResponse = Device[];
