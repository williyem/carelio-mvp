import { create } from 'zustand';
import type {
  Vital,
  VitalType,
  FormattedVitals,
  ThermometerReading,
  PulseOxReading,
  BloodPressureReading,
  WeightScaleReading,
  GlucoseReading,
} from '@/types/vitals.types';

interface LiveVitalsState {
  // Raw vitals by type (most recent for each type)
  vitals: Record<VitalType, Vital | null>;

  // All vitals for the current appointment
  allVitals: Vital[];

  // Connection state
  isConnected: boolean;

  // Actions
  addVital: (vital: Vital) => void;
  updateVital: (vital: Vital) => void;
  setVitals: (vitals: Vital[]) => void;
  clearVitals: () => void;
  setConnected: (connected: boolean) => void;

  // Computed
  getFormattedVitals: () => FormattedVitals;
}

const initialVitals: Record<VitalType, Vital | null> = {
  thermometer: null,
  'pulse-ox': null,
  'blood-pressure': null,
  glucose: null,
  'weight-scale': null,
};

export const useLiveVitalsStore = create<LiveVitalsState>((set, get) => ({
  vitals: { ...initialVitals },
  allVitals: [],
  isConnected: false,

  addVital: (vital: Vital) => {
    set((state) => ({
      vitals: {
        ...state.vitals,
        [vital.vitalType]: vital,
      },
      allVitals: [vital, ...state.allVitals],
    }));
  },

  updateVital: (vital: Vital) => {
    set((state) => ({
      vitals: {
        ...state.vitals,
        [vital.vitalType]: vital,
      },
      allVitals: state.allVitals.map((v) => (v.id === vital.id ? vital : v)),
    }));
  },

  setVitals: (vitals: Vital[]) => {
    const vitalsByType: Record<VitalType, Vital | null> = { ...initialVitals };

    // Get most recent vital for each type
    vitals.forEach((vital) => {
      const existing = vitalsByType[vital.vitalType];
      if (
        !existing ||
        new Date(vital.recordedAt) > new Date(existing.recordedAt)
      ) {
        vitalsByType[vital.vitalType] = vital;
      }
    });

    set({
      vitals: vitalsByType,
      allVitals: vitals,
    });
  },

  clearVitals: () => {
    set({
      vitals: { ...initialVitals },
      allVitals: [],
    });
  },

  setConnected: (connected: boolean) => {
    set({ isConnected: connected });
  },

  getFormattedVitals: (): FormattedVitals => {
    const { vitals } = get();
    let lastUpdated: Date | null = null;

    // Find the most recent update time
    Object.values(vitals).forEach((vital) => {
      if (vital) {
        const recordedAt = new Date(vital.recordedAt);
        if (!lastUpdated || recordedAt > lastUpdated) {
          lastUpdated = recordedAt;
        }
      }
    });

    // Extract heart rate from pulse-ox or blood-pressure
    let heartRate: string | null = null;
    const pulseOx = vitals['pulse-ox'];
    const bp = vitals['blood-pressure'];

    if (pulseOx?.reading) {
      const reading = pulseOx.reading as PulseOxReading;
      if (reading.pulse) {
        heartRate = `${reading.pulse} bpm`;
      }
    } else if (bp?.reading) {
      const reading = bp.reading as BloodPressureReading;
      if (reading.pulse) {
        heartRate = `${reading.pulse} bpm`;
      }
    }

    // Blood pressure
    let bloodPressure: string | null = null;
    if (bp?.reading) {
      const reading = bp.reading as BloodPressureReading;
      if (reading.systolic) {
        bloodPressure = reading.diastolic
          ? `${reading.systolic}/${reading.diastolic} mmHg`
          : `${reading.systolic} mmHg`;
      }
    }

    // Temperature
    let temperature: string | null = null;
    const thermo = vitals['thermometer'];
    if (thermo?.reading) {
      const reading = thermo.reading as ThermometerReading;
      if (reading.temperatureF) {
        temperature = `${reading.temperatureF.toFixed(1)}°F`;
      } else if (reading.temperatureC) {
        temperature = `${reading.temperatureC.toFixed(1)}°C`;
      }
    }

    // O2 Saturation
    let oxygenSaturation: string | null = null;
    if (pulseOx?.reading) {
      const reading = pulseOx.reading as PulseOxReading;
      if (reading.spo2) {
        oxygenSaturation = `${reading.spo2}%`;
      }
    }

    // Weight
    let weight: string | null = null;
    const weightVital = vitals['weight-scale'];
    if (weightVital?.reading) {
      const reading = weightVital.reading as WeightScaleReading;
      if (reading.weightLbs) {
        weight = `${reading.weightLbs.toFixed(1)} lbs`;
      } else if (reading.weightKg) {
        weight = `${reading.weightKg.toFixed(1)} kg`;
      }
    }

    // Glucose
    let glucose: string | null = null;
    const glucoseVital = vitals['glucose'];
    if (glucoseVital?.reading) {
      const reading = glucoseVital.reading as GlucoseReading;
      if (reading.value) {
        glucose = `${reading.value} mg/dL`;
      }
    }

    return {
      heartRate,
      bloodPressure,
      temperature,
      oxygenSaturation,
      respirationRate: null, // Not captured by current devices
      weight,
      glucose,
      lastUpdated: lastUpdated ? formatTime(lastUpdated) : null,
    };
  },
}));

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
