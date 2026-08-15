import { DEVICE_GUIDES } from '@/lib/device-guides';

export const MEASUREMENT_TYPES = [
  'thermometer',
  'blood-pressure',
  'pulse-ox',
  'glucose',
  'weight-scale',
] as const;

export type MeasurementType = (typeof MEASUREMENT_TYPES)[number];

export const MEASUREMENT_KEYWORDS: Record<MeasurementType, string[]> = {
  'blood-pressure': [
    'blood pressure',
    'bp',
    'systolic',
    'diastolic',
    'pressure check',
  ],
  thermometer: ['temperature', 'temp', 'fever', 'body temp', 'thermometer'],
  'pulse-ox': [
    'oxygen',
    'spo2',
    'sp o2',
    'pulse ox',
    'pulse oximeter',
    'heart rate',
    'pulse rate',
  ],
  glucose: ['glucose', 'blood sugar', 'blood glucose', 'sugar level'],
  'weight-scale': ['weight', 'weigh', 'body weight', 'scale'],
};

export function labelForMeasurement(type: string): string {
  const guide = DEVICE_GUIDES.find((item) => item.slug === type);
  return guide?.shortLabel || type.replace(/-/g, ' ');
}

export function isMeasurementType(value: string): value is MeasurementType {
  return (MEASUREMENT_TYPES as readonly string[]).includes(value);
}

export const MEASUREMENT_OPTIONS = MEASUREMENT_TYPES.map((type) => ({
  value: type,
  label: labelForMeasurement(type),
}));
