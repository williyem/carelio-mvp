import { create } from 'zustand';
import type { DeviceCatalogEntry } from '@/native-bridge/types';

export type DeviceSlug =
  | 'thermometer'
  | 'pulse-ox'
  | 'blood-pressure'
  | 'glucose'
  | 'weight-scale'
  | 'stethoscope'
  | 'microscope';

export type DeviceStatus = 'active' | 'inactive' | 'disconnected';

export interface DeviceReading {
  value: string;
  timestamp: string;
  raw?: unknown;
}

export interface DeviceConnection {
  id: string;
  slug: DeviceSlug;
  name: string;
  identifier: string;
  macAddress?: string;
  isKnown: boolean;
  status: DeviceStatus;
  lastConnectedAt?: string;
  lastReadingAt?: string;
  lastReading?: DeviceReading;
}

interface DeviceState {
  // Device list from backend
  devices: DeviceConnection[];
  setDevices: (devices: DeviceConnection[]) => void;

  // Discovered devices from native shell (via devices.state.catalog)
  discoveredDevices: DeviceCatalogEntry[];
  setDiscoveredDevices: (devices: DeviceCatalogEntry[]) => void;

  // Live readings during consultation (keyed by device slug)
  liveReadings: Record<string, DeviceReading>;
  updateReading: (slug: string, reading: DeviceReading) => void;
  clearReadings: () => void;

  // Connection status (keyed by device slug)
  connectionStatus: Record<string, DeviceStatus>;
  setConnectionStatus: (slug: string, status: DeviceStatus) => void;

  // Modal state
  isConfigModalOpen: boolean;
  openConfigModal: () => void;
  closeConfigModal: () => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Actions
  addDevice: (device: DeviceConnection) => void;
  updateDevice: (deviceId: string, updates: Partial<DeviceConnection>) => void;
  removeDevice: (deviceId: string) => void;

  // Get devices by category
  getKnownDevices: () => DeviceConnection[];
  getUnknownDevices: () => DeviceConnection[];
  getConnectedDevices: () => DeviceConnection[];
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  // Initial state
  devices: [],
  discoveredDevices: [],
  liveReadings: {},
  connectionStatus: {},
  isConfigModalOpen: false,
  isLoading: false,

  // Device list management
  setDevices: (devices) => set({ devices }),

  // Discovered devices from native shell
  setDiscoveredDevices: (devices) => set({ discoveredDevices: devices }),

  addDevice: (device) =>
    set((state) => ({
      devices: [...state.devices, device],
    })),

  updateDevice: (deviceId, updates) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === deviceId ? { ...d, ...updates } : d
      ),
    })),

  removeDevice: (deviceId) =>
    set((state) => ({
      devices: state.devices.filter((d) => d.id !== deviceId),
    })),

  // Live readings management
  updateReading: (slug, reading) =>
    set((state) => ({
      liveReadings: {
        ...state.liveReadings,
        [slug]: reading,
      },
    })),

  clearReadings: () => set({ liveReadings: {} }),

  // Connection status management
  setConnectionStatus: (slug, status) =>
    set((state) => ({
      connectionStatus: {
        ...state.connectionStatus,
        [slug]: status,
      },
    })),

  // Modal state
  openConfigModal: () => set({ isConfigModalOpen: true }),
  closeConfigModal: () => set({ isConfigModalOpen: false }),

  // Loading state
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Computed getters
  getKnownDevices: () => get().devices.filter((d) => d.isKnown),
  getUnknownDevices: () => get().devices.filter((d) => !d.isKnown),
  getConnectedDevices: () => get().devices.filter((d) => d.status === 'active'),
}));
