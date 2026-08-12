export const DEVICE_QUERY_KEYS = {
  ALL: ['devices'] as const,
  DEVICES: () => [...DEVICE_QUERY_KEYS.ALL, 'list'] as const,
  KNOWN_DEVICES: () => [...DEVICE_QUERY_KEYS.ALL, 'known'] as const,
  UNKNOWN_DEVICES: () => [...DEVICE_QUERY_KEYS.ALL, 'unknown'] as const,
  DEVICE: (deviceId: string) => [...DEVICE_QUERY_KEYS.ALL, deviceId] as const,
};
