export { Devices } from './devices';
export { NativeDevice } from './base';
export { Thermometer, type ThermometerReading } from './thermometer';
export { BloodPressure, type BloodPressureReading } from './blood-pressure';
export { PulseOx, type PulseOxReading } from './pulse-ox';
export { Glucose, type GlucoseReading } from './glucose';
export { WeightScale, type WeightScaleReading } from './weight-scale';
export { Microscope, type MicroscopeReading } from './microscope';
export { Stethoscope, type StethoscopeReading } from './stethoscope';

import { Thermometer } from './thermometer';
import { BloodPressure } from './blood-pressure';
import { PulseOx } from './pulse-ox';
import { Glucose } from './glucose';
import { WeightScale } from './weight-scale';
import { Microscope } from './microscope';
import { Stethoscope } from './stethoscope';

export const AllDevices = [
  Thermometer,
  BloodPressure,
  PulseOx,
  Glucose,
  WeightScale,
  Microscope,
  Stethoscope,
] as const;
