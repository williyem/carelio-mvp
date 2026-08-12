// Core
export { initNativeBridge, isRunningInNativeShell } from './bridge';
export { initMockBridge, fireMockReadings } from './mock';

// Permissions
export { Permissions } from './permissions';

// Devices
export {
  Devices,
  AllDevices,
  NativeDevice,
  Thermometer,
  type ThermometerReading,
  BloodPressure,
  type BloodPressureReading,
  PulseOx,
  type PulseOxReading,
  Glucose,
  type GlucoseReading,
  WeightScale,
  type WeightScaleReading,
  Microscope,
  type MicroscopeReading,
  Stethoscope,
  type StethoscopeReading,
} from './devices';

// Types
export type {
  PermissionType,
  PermissionStatus,
  PermissionStateEvent,
  PermissionErrorEvent,
  DeviceListenStateEvent,
  DeviceCatalogStateEvent,
  DeviceCatalogEntry,
  DeviceResultEvent,
  DeviceReadingSource,
  RawRecordEntry,
  NativeBridgeEvent,
} from './types';
