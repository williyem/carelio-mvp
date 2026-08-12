import { Device, DeviceStatus, DeviceType } from '@/types/device.types';
import ThermometerSvg from '@/assets/icons/thermometer-svg';
import WeightScaleSvg from '@/assets/icons/weight-scale-svg';
import BloodPressureCuffSvg from '@/assets/icons/blood-pressure-cuff-svg';
import StethoscopeSvg from '@/assets/icons/stethoscope-svg';
import PulseOxSvg from '@/assets/icons/pulse-ox-svg';
import GlucoseMeterSvg from '@/assets/icons/glucose-meter-svg';
import OtoscopeSvg from '@/assets/icons/otoscope-svg';
import EkgSvg from '@/assets/icons/ekg-svg';
import { getDevices as getDevicesFromDummyData } from '@/lib/dummy-data/loader';

type DummyDevice = {
  id: string;
  name: string;
  status: DeviceStatus;
  type: DeviceType;
  lastReading?: { value: string; timestamp: string };
};

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  Thermometer: <ThermometerSvg />,
  'Weight Scale': <WeightScaleSvg />,
  'Blood Pressure Cuff': <BloodPressureCuffSvg />,
  Stethoscope: <StethoscopeSvg />,
  'Pulse Ox': <PulseOxSvg />,
  'Glucose Meter': <GlucoseMeterSvg />,
  Otoscope: <OtoscopeSvg />,
  EKG: <EkgSvg />,
};

const mapDeviceIcon = (name: string): React.ReactNode =>
  DEVICE_ICONS[name] ?? <StethoscopeSvg />;

/**
 * Get list of devices from dummy-data/devices.json.
 * Icon components are mapped in code; swap to API call when backend is ready.
 */
export async function getDevices(): Promise<Device[]> {
  const devices = getDevicesFromDummyData() as DummyDevice[];

  return devices.map((device) => ({
    id: device.id,
    name: device.name,
    status: device.status,
    type: device.type,
    icon: mapDeviceIcon(device.name),
    lastReading: device.lastReading,
  }));
}
