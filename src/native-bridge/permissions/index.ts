import { send, subscribe } from '../bridge';
import type {
  PermissionType,
  PermissionStateEvent,
  PermissionErrorEvent,
} from '../types';

export const Permissions = {
  read(permission: PermissionType): void {
    send({ id: `permissions.read.${permission}` });
  },

  request(permission: PermissionType): void {
    send({ id: `permissions.request.${permission}` });
  },

  openSettings(permission?: PermissionType): void {
    send({
      id: 'permissions.openSettings',
      ...(permission ? { permission } : {}),
    });
  },

  onState(
    permission: PermissionType,
    callback: (event: PermissionStateEvent) => void
  ): () => void {
    return subscribe((msg) => {
      if (msg.id === `permissions.state.${permission}`)
        callback(msg as PermissionStateEvent);
    });
  },

  onError(
    permission: PermissionType,
    callback: (event: PermissionErrorEvent) => void
  ): () => void {
    return subscribe((msg) => {
      if (msg.id === `permissions.error.${permission}`)
        callback(msg as PermissionErrorEvent);
    });
  },

  mockStates: [
    {
      id: 'permissions.state.bluetooth' as const,
      permission: 'bluetooth' as const,
      status: 'authorized' as const,
      timestamp: '2026-02-06T12:00:00.000Z',
      canRequest: false,
    },
    {
      id: 'permissions.state.camera' as const,
      permission: 'camera' as const,
      status: 'authorized' as const,
      timestamp: '2026-02-06T12:00:00.000Z',
      canRequest: false,
    },
    {
      id: 'permissions.state.microphone' as const,
      permission: 'microphone' as const,
      status: 'authorized' as const,
      timestamp: '2026-02-06T12:00:00.000Z',
      canRequest: false,
    },
  ],
};

export type { PermissionType, PermissionStateEvent, PermissionErrorEvent };
