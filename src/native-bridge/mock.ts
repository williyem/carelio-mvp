import { handleNativeMessage } from './bridge';
import { Permissions } from './permissions';
import { thermometerMock } from './devices/thermometer';
import { bloodPressureMock } from './devices/blood-pressure';
import { pulseOxMock } from './devices/pulse-ox';
import { glucoseMock } from './devices/glucose';
import { weightScaleMock } from './devices/weight-scale';
import type {
  DeviceResultEvent,
  DeviceCatalogStateEvent,
  PermissionType,
} from './types';

// Legacy Fora-style mocks (for backwards compatibility)
const deviceMocksLegacy = [
  thermometerMock,
  bloodPressureMock,
  pulseOxMock,
  glucoseMock,
  weightScaleMock,
];

// Shell-style (Taidoc) mocks - simulates real iOS shell behavior
const bloodPressureMockShell: DeviceResultEvent = {
  id: 'devices.result.TD3140',
  deviceId: 'mock-bp-td3140',
  identifier: 'TD3140',
  date: new Date().toISOString(),
  meterName: 'TD-3140 (BP Meter)',
  mac: '00:11:22:33:44:55',
  data: [
    {
      recordedAt: new Date().toISOString(),
      systolic: 118,
      diastolic: 78,
      pulse: 70,
      irregularHeartbeat: false,
    },
  ],
};

const pulseOxMockShell: DeviceResultEvent = {
  id: 'devices.result.TD8255',
  deviceId: 'mock-po-td8255',
  identifier: 'TD8255',
  date: new Date().toISOString(),
  meterName: 'TD-8255 (Pulse Ox)',
  mac: '00:11:22:33:44:56',
  data: [
    {
      recordedAt: new Date().toISOString(),
      spo2: 97,
      pulse: 72,
      pi: 5.2,
    },
  ],
};

const thermometerMockShell: DeviceResultEvent = {
  id: 'devices.result.TD8201',
  deviceId: 'mock-therm-td8201',
  identifier: 'TD8201',
  date: new Date().toISOString(),
  meterName: 'TD-8201',
  mac: '00:11:22:33:44:57',
  data: [
    {
      recordedAt: new Date().toISOString(),
      temperatureC: 36.8,
      temperatureF: 98.2,
      ambientC: 22.5,
      ambientF: 72.5,
    },
  ],
};

const glucoseMockShell: DeviceResultEvent = {
  id: 'devices.result.TD1261',
  deviceId: 'mock-glucose-td1261',
  identifier: 'TD1261',
  date: new Date().toISOString(),
  meterName: 'TD-1261',
  mac: '00:11:22:33:44:58',
  data: [
    {
      recordedAt: new Date().toISOString(),
      value: 102,
      type: 0,
      subType: 0,
      subValue: 0,
    },
  ],
};

// Shell-style device mocks (Taidoc identifiers)
const deviceMocksShell = [
  bloodPressureMockShell,
  pulseOxMockShell,
  thermometerMockShell,
  glucoseMockShell,
];

// Mock catalog state (simulates devices.state.catalog from shell)
const catalogStateMock: DeviceCatalogStateEvent = {
  id: 'devices.state.catalog',
  devices: [
    {
      id: 'mock-bp-td3140',
      name: 'TD-3140 (BP Meter)',
      connected: true,
      state: 'connected',
      identifier: 'TD3140',
      meterName: 'TD-3140 (BP Meter)',
      mac: '00:11:22:33:44:55',
      rssi: -65,
    },
    {
      id: 'mock-po-td8255',
      name: 'TD-8255 (Pulse Ox)',
      connected: true,
      state: 'connected',
      identifier: 'TD8255',
      meterName: 'TD-8255 (Pulse Ox)',
      mac: '00:11:22:33:44:56',
      rssi: -70,
    },
    {
      id: 'mock-therm-td8201',
      name: 'TD-8201',
      connected: false,
      state: 'discovered',
      identifier: 'TD8201',
      meterName: 'TD-8201',
      mac: '00:11:22:33:44:57',
      rssi: -80,
    },
  ],
};

export function initMockBridge(): void {
  // Fire mock permission states
  for (const state of Permissions.mockStates) {
    setTimeout(() => handleNativeMessage(state), 100);
  }

  // Fire mock device results with staggered timing (using shell-style mocks)
  deviceMocksShell.forEach((mock, i) => {
    setTimeout(() => handleNativeMessage(mock), (i + 1) * 300);
  });
}

/**
 * Manually fire mock device readings - useful for testing during a call.
 * Uses shell-style Taidoc identifiers (TD3140, TD8255, etc.)
 */
export function fireMockReadings(): void {
  console.log('Firing mock device readings (shell-style)...');

  // First fire catalog state to show discovered devices
  setTimeout(() => {
    console.log('Mock catalog state');
    handleNativeMessage(catalogStateMock);
  }, 200);

  // Then fire device readings
  deviceMocksShell.forEach((mock, i) => {
    setTimeout(
      () => {
        console.log(`Mock reading: ${mock.identifier}`);
        handleNativeMessage(mock);
      },
      (i + 2) * 500
    );
  });
}

/**
 * Fire legacy Fora-style mock readings (for backwards compatibility testing)
 */
export function fireMockReadingsLegacy(): void {
  console.log('Firing mock device readings (legacy Fora-style)...');
  deviceMocksLegacy.forEach((mock, i) => {
    setTimeout(
      () => {
        console.log(`Mock reading: ${mock.identifier}`);
        handleNativeMessage(mock);
      },
      (i + 1) * 500
    );
  });
}

/**
 * Fire mock permission state for testing permission flows.
 */
export function fireMockPermissionState(
  type: PermissionType,
  status: 'authorized' | 'denied' | 'notDetermined' | 'restricted'
): void {
  handleNativeMessage({
    id: `permissions.state.${type}` as const,
    permission: type,
    status,
    timestamp: new Date().toISOString(),
    canRequest: status === 'notDetermined',
  });
}

/**
 * Fire mock catalog state for testing device discovery UI.
 */
export function fireMockCatalogState(): void {
  handleNativeMessage(catalogStateMock);
}

// Expose globally for easy console testing
if (typeof window !== 'undefined') {
  const w = window as Window & {
    __fireMockReadings?: typeof fireMockReadings;
    __fireMockReadingsLegacy?: typeof fireMockReadingsLegacy;
    __fireMockPermissionState?: typeof fireMockPermissionState;
    __fireMockCatalogState?: typeof fireMockCatalogState;
  };
  w.__fireMockReadings = fireMockReadings;
  w.__fireMockReadingsLegacy = fireMockReadingsLegacy;
  w.__fireMockPermissionState = fireMockPermissionState;
  w.__fireMockCatalogState = fireMockCatalogState;
}
