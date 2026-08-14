export type DeviceGuideSlug =
  | 'thermometer'
  | 'blood-pressure'
  | 'pulse-ox'
  | 'glucose'
  | 'weight-scale';

export type DeviceGuide = {
  slug: DeviceGuideSlug;
  title: string;
  shortLabel: string;
  description: string;
  image: string;
  video?: string;
  tips: string[];
  steps: string[];
};

export const DEVICE_GUIDES: DeviceGuide[] = [
  {
    slug: 'thermometer',
    title: 'Digital thermometer',
    shortLabel: 'Temperature',
    description:
      'Measures body temperature. Prefer oral or temporal readings unless your clinician asks otherwise.',
    image: '/device-guides/thermometer/hero.jpg',
    video: '/device-guides/thermometer/demo.mp4',
    tips: [
      'Wait 15 minutes after hot/cold drinks before an oral reading.',
      'Keep the tip clean and dry before each use.',
    ],
    steps: [
      'Turn the thermometer on and wait for the ready indicator.',
      'Place it under the tongue (or against the temple for temporal models).',
      'Hold still until it beeps or the reading locks.',
      'Confirm the value on Carelio, or enter it manually if the device did not sync.',
    ],
  },
  {
    slug: 'blood-pressure',
    title: 'Blood pressure cuff',
    shortLabel: 'Blood pressure',
    description:
      'Measures systolic and diastolic pressure, usually from the upper arm.',
    image: '/device-guides/blood-pressure/hero.jpg',
    video: '/device-guides/blood-pressure/demo.mp4',
    tips: [
      'Sit with feet flat and the arm resting at heart level.',
      'Avoid talking during the measurement.',
    ],
    steps: [
      'Wrap the cuff snugly around the bare upper arm.',
      'Align the artery marker with the inside of the elbow crease.',
      'Press start and stay still until the cuff deflates.',
      'Review systolic/diastolic values, then confirm in Carelio.',
    ],
  },
  {
    slug: 'pulse-ox',
    title: 'Pulse oximeter',
    shortLabel: 'Heart rate / SpO₂',
    description:
      'Clips onto a fingertip to estimate heart rate and oxygen saturation.',
    image: '/device-guides/pulse-ox/hero.jpg',
    video: '/device-guides/pulse-ox/demo.mp4',
    tips: [
      'Remove dark nail polish if readings look unstable.',
      'Warm cold fingers before measuring.',
    ],
    steps: [
      'Open the clip and place it on the index or middle finger.',
      'Keep the hand still with the display facing up.',
      'Wait until SpO₂ and pulse stabilize (usually a few seconds).',
      'Confirm the reading in Carelio or enter it manually.',
    ],
  },
  {
    slug: 'glucose',
    title: 'Glucose meter',
    shortLabel: 'Blood glucose',
    description:
      'Measures blood glucose from a fingerstick sample using a test strip.',
    image: '/device-guides/glucose/hero.jpg',
    video: '/device-guides/glucose/demo.mp4',
    tips: [
      'Wash and dry hands before testing.',
      'Use a new lancet and strip for each reading.',
    ],
    steps: [
      'Insert a test strip and wait for the meter to prompt for a sample.',
      'Lance the side of a fingertip and apply a drop to the strip.',
      'Wait for the meter result.',
      'Confirm the value in Carelio or record it manually.',
    ],
  },
  {
    slug: 'weight-scale',
    title: 'Weight scale',
    shortLabel: 'Weight',
    description: 'Measures body weight. Prefer a hard, level floor.',
    image: '/device-guides/weight-scale/hero.jpg',
    video: '/device-guides/weight-scale/demo.mp4',
    tips: [
      'Weigh at a consistent time of day when possible.',
      'Remove shoes and heavy outerwear for comparable readings.',
    ],
    steps: [
      'Place the scale on a hard, flat surface.',
      'Step on with weight evenly distributed.',
      'Stand still until the reading locks.',
      'Confirm the weight in Carelio or enter it manually.',
    ],
  },
];

export function getDeviceGuide(slug: string): DeviceGuide | undefined {
  return DEVICE_GUIDES.find((guide) => guide.slug === slug);
}
