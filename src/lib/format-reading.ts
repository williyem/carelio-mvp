import type {
  ThermometerReading,
  BloodPressureReading,
  PulseOxReading,
  GlucoseReading,
  WeightScaleReading,
} from '@/native-bridge';

type FormattedReading = { value: string; timestamp: string };

export function formatReading(
  slug: string,
  reading: unknown
): FormattedReading | null {
  if (!reading || typeof reading !== 'object') return null;

  const r = reading as Record<string, unknown>;
  const timestampSource =
    (typeof r.recordedAt === 'string' && r.recordedAt) || '';
  const timestamp = timestampSource
    ? new Date(timestampSource).toLocaleString()
    : '';

  switch (slug) {
    case 'thermometer': {
      const t = reading as ThermometerReading;
      return { value: `${t.temperatureC}°C (${t.temperatureF}°F)`, timestamp };
    }
    case 'blood-pressure': {
      const bp = reading as BloodPressureReading;
      return { value: `${bp.systolic}/${bp.diastolic} mmHg`, timestamp };
    }
    case 'pulse-ox': {
      const po = reading as PulseOxReading;
      return { value: `SpO2 ${po.spo2}% · Pulse ${po.pulse}`, timestamp };
    }
    case 'glucose': {
      const g = reading as GlucoseReading;
      return { value: `${g.value} mg/dL`, timestamp };
    }
    case 'weight-scale': {
      const w = reading as WeightScaleReading;
      return { value: `${w.weightLbs} lbs`, timestamp };
    }
    default:
      return { value: 'Data received', timestamp };
  }
}
