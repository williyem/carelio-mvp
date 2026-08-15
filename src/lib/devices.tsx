import { Device, DeviceStatus, DeviceType } from '@/types/device.types';
import ThermometerSvg from '@/assets/icons/thermometer-svg';
import WeightScaleSvg from '@/assets/icons/weight-scale-svg';
import BloodPressureCuffSvg from '@/assets/icons/blood-pressure-cuff-svg';
import StethoscopeSvg from '@/assets/icons/stethoscope-svg';
import PulseOxSvg from '@/assets/icons/pulse-ox-svg';
import GlucoseMeterSvg from '@/assets/icons/glucose-meter-svg';
import OtoscopeSvg from '@/assets/icons/otoscope-svg';
import EkgSvg from '@/assets/icons/ekg-svg';

type DeviceCatalogItem = {
  id: string;
  name: string;
  status: DeviceStatus;
  type: DeviceType;
};

const DEVICE_CATALOG: DeviceCatalogItem[] = [
  { id: 'DEV001', name: 'Thermometer', status: 'connected', type: 'known' },
  { id: 'DEV002', name: 'Weight Scale', status: 'connected', type: 'known' },
  {
    id: 'DEV003',
    name: 'Blood Pressure Cuff',
    status: 'connected',
    type: 'known',
  },
  { id: 'DEV004', name: 'Stethoscope', status: 'disconnected', type: 'known' },
  { id: 'DEV005', name: 'Pulse Ox', status: 'connected', type: 'known' },
  { id: 'DEV006', name: 'Glucose Meter', status: 'connected', type: 'known' },
  { id: 'DEV007', name: 'Otoscope', status: 'disconnected', type: 'unknown' },
  { id: 'DEV008', name: 'EKG', status: 'disconnected', type: 'unknown' },
];

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

export async function getDevices(): Promise<Device[]> {
  return DEVICE_CATALOG.map((device) => ({
    id: device.id,
    name: device.name,
    status: device.status,
    type: device.type,
    icon: mapDeviceIcon(device.name),
  }));
}
