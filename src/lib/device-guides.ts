export type DeviceGuideSlug = string;

export const KNOWN_DEVICE_GUIDE_SLUGS = [
  'thermometer',
  'blood-pressure',
  'pulse-ox',
  'glucose',
  'weight-scale',
] as const;

export type KnownDeviceGuideSlug = (typeof KNOWN_DEVICE_GUIDE_SLUGS)[number];

export type DeviceGuide = {
  slug: DeviceGuideSlug;
  title: string;
  shortLabel: string;
  description: string;
  /** Primary image path or absolute URL */
  image: string;
  /** Alias for API / admin form compatibility */
  imageUrl?: string;
  video?: string;
  youtubeUrl?: string;
  tips: string[];
  steps: string[];
  sortOrder?: number;
  isActive?: boolean;
};

export function slugifyDeviceTitle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export const DEVICE_GUIDES: DeviceGuide[] = [
  {
    slug: 'thermometer',
    title: 'Digital thermometer',
    shortLabel: 'Temperature',
    description:
      'Measures body temperature. Prefer oral or temporal readings unless your clinician asks otherwise.',
    image: '/device-guides/thermometer/hero.jpg',
    video: '/device-guides/thermometer/demo.mp4',
    youtubeUrl: '',
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
    sortOrder: 1,
    isActive: true,
  },
  {
    slug: 'blood-pressure',
    title: 'Blood pressure cuff',
    shortLabel: 'Blood pressure',
    description:
      'Measures systolic and diastolic pressure, usually from the upper arm.',
    image: '/device-guides/blood-pressure/hero.jpg',
    video: '/device-guides/blood-pressure/demo.mp4',
    youtubeUrl: '',
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
    sortOrder: 2,
    isActive: true,
  },
  {
    slug: 'pulse-ox',
    title: 'Pulse oximeter',
    shortLabel: 'Heart rate / SpO₂',
    description:
      'Clips onto a fingertip to estimate heart rate and oxygen saturation.',
    image: '/device-guides/pulse-ox/hero.jpg',
    video: '/device-guides/pulse-ox/demo.mp4',
    youtubeUrl: '',
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
    sortOrder: 3,
    isActive: true,
  },
  {
    slug: 'glucose',
    title: 'Glucose meter',
    shortLabel: 'Blood glucose',
    description:
      'Measures blood glucose from a fingerstick sample using a test strip.',
    image: '/device-guides/glucose/hero.jpg',
    video: '/device-guides/glucose/demo.mp4',
    youtubeUrl: '',
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
    sortOrder: 4,
    isActive: true,
  },
  {
    slug: 'weight-scale',
    title: 'Weight scale',
    shortLabel: 'Weight',
    description: 'Measures body weight. Prefer a hard, level floor.',
    image: '/device-guides/weight-scale/hero.jpg',
    video: '/device-guides/weight-scale/demo.mp4',
    youtubeUrl: '',
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
    sortOrder: 5,
    isActive: true,
  },
];

export function guideImage(guide: DeviceGuide): string {
  return guide.imageUrl || guide.image || '';
}

export function getDeviceGuide(slug: string): DeviceGuide | undefined {
  return DEVICE_GUIDES.find((guide) => guide.slug === slug);
}

/** Extract a YouTube embed URL from a watch/share/youtu.be link. */
export function toYouTubeEmbedUrl(url: string | undefined): string | null {
  if (!url?.trim()) return null;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = parsed.pathname.replace(/^\//, '');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = parsed.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      const embedMatch = parsed.pathname.match(/\/embed\/([^/]+)/);
      if (embedMatch?.[1])
        return `https://www.youtube.com/embed/${embedMatch[1]}`;
    }
  } catch {
    return null;
  }
  return null;
}
