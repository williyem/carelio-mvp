export const DEVICE_ENDPOINTS = {
  GET_DEVICES: '/devices',
  GET_KNOWN_DEVICES: '/devices/known',
  GET_UNKNOWN_DEVICES: '/devices/unknown',
  GET_DEVICE: '/devices/:deviceId',
  CREATE_DEVICE: '/devices',
  UPDATE_DEVICE: '/devices/:deviceId',
  DELETE_DEVICE: '/devices/:deviceId',
  CONNECT_DEVICE: '/devices/:deviceId/connect',
  DISCONNECT_DEVICE: '/devices/:deviceId/disconnect',
} as const;
