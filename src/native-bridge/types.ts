export type BridgeMessage = { id: string; [key: string]: unknown };

export type BridgeListener = (message: BridgeMessage) => void;

export type RawRecordEntry = {
  recordedAt: string;
} & Record<string, unknown>;

export type DeviceReadingSource = {
  eventId: `devices.result.${string}`;
  eventIdentifier: string;
  eventDate: string;
  deviceId: string;
  mac?: string;
  meterName?: string;
};

export type DeviceResultEvent = {
  id: `devices.result.${string}`;
  deviceId: string;
  identifier: string;
  date: string;
  mac?: string;
  meterName?: string;
  data: RawRecordEntry[];
  debugSelection?: {
    selectedIndex: number;
    selectedSignature: string;
    reason: string;
    candidateCount: number;
  };
  debugEntries?: Array<{
    index: number;
    selected: boolean;
    signature: string;
    recordClass: string;
    fetchedUser: number;
    storagePosition: number | null;
    recordedAt: string;
    selectionScore: Record<string, unknown>;
    encodedEntry: RawRecordEntry;
  }>;
};

export type DeviceListenStateEvent = {
  id: 'devices.state.listen';
  active: boolean;
  models: string[];
};

export type DeviceConnectionState =
  | 'discovered'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed';

export type DeviceCatalogEntry = {
  id: string;
  name: string;
  connected: boolean;
  state: DeviceConnectionState | string;
  mac?: string;
  rssi?: number;
  meterName?: string;
  identifier?: string;
  errorDescription?: string;
};

export type DeviceCatalogStateEvent = {
  id: 'devices.state.catalog';
  devices: DeviceCatalogEntry[];
};

export type PermissionType = 'bluetooth' | 'camera' | 'microphone';

export type PermissionStatus =
  | 'notDetermined'
  | 'denied'
  | 'restricted'
  | 'authorized'
  | 'limited'
  | 'unsupported';

export type PermissionStateEvent = {
  id: `permissions.state.${PermissionType}`;
  permission: PermissionType;
  status: PermissionStatus;
  timestamp: string;
  canRequest: boolean;
};

export type PermissionErrorEvent = {
  id: `permissions.error.${PermissionType}`;
  permission: PermissionType;
  message: string;
};

export type NativeBridgeEvent =
  | PermissionStateEvent
  | PermissionErrorEvent
  | DeviceListenStateEvent
  | DeviceCatalogStateEvent
  | DeviceResultEvent;
