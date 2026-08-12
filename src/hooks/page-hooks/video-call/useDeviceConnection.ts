'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import {
  Devices,
  AllDevices,
  Permissions,
  isRunningInNativeShell,
  fireMockReadings,
  type PermissionStatus,
  type PermissionType,
  type DeviceListenStateEvent,
} from '@/native-bridge';
import { useDeviceStore } from '@/stores/device-store';
import { formatReading } from '@/lib/format-reading';

const REQUIRED_PERMISSIONS: PermissionType[] = [
  'camera',
  'microphone',
  'bluetooth',
];

function normalizeIdentifier(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, '').toUpperCase();
}

interface UseDeviceConnectionOptions {
  autoStart?: boolean;
  onReadingReceived?: (slug: string, reading: unknown) => void;
}

export function useDeviceConnection(options: UseDeviceConnectionOptions = {}) {
  const { autoStart = false, onReadingReceived } = options;
  const isListeningRef = useRef(false);

  const [permissionStatus, setPermissionStatus] = useState<
    Record<PermissionType, PermissionStatus | null>
  >({
    bluetooth: null,
    camera: null,
    microphone: null,
  });

  const {
    updateReading,
    setConnectionStatus,
    setDiscoveredDevices,
    clearReadings,
  } = useDeviceStore();

  const checkPermission = useCallback(async (type: PermissionType) => {
    return new Promise<PermissionStatus>((resolve) => {
      const unsub = Permissions.onState(type, (event) => {
        unsub();
        setPermissionStatus((prev) => ({ ...prev, [type]: event.status }));
        resolve(event.status);
      });

      Permissions.read(type);

      setTimeout(() => {
        unsub();
        resolve('notDetermined');
      }, 5000);
    });
  }, []);

  const requestPermission = useCallback(async (type: PermissionType) => {
    return new Promise<PermissionStatus>((resolve) => {
      const unsubState = Permissions.onState(type, (event) => {
        unsubState();
        setPermissionStatus((prev) => ({ ...prev, [type]: event.status }));
        resolve(event.status);
      });

      const unsubError = Permissions.onError(type, (event) => {
        unsubError();
        console.error(`${type} permission error:`, event.message);
        resolve('denied');
      });

      Permissions.request(type);

      setTimeout(() => {
        unsubState();
        unsubError();
        resolve('notDetermined');
      }, 10000);
    });
  }, []);

  /**
   * Ensure all required permissions are granted.
   * Checks each permission and requests if not determined.
   * @returns true if all permissions are authorized
   */
  const ensurePermissions = useCallback(async (): Promise<boolean> => {
    // Skip permission checks when not in native shell (mock mode)
    if (!isRunningInNativeShell()) {
      return true;
    }

    for (const type of REQUIRED_PERMISSIONS) {
      let status = await checkPermission(type);

      if (status === 'notDetermined') {
        status = await requestPermission(type);
      }

      if (status !== 'authorized') {
        console.warn(`${type} permission not granted:`, status);
        return false;
      }
    }

    return true;
  }, [checkPermission, requestPermission]);

  /**
   * Check if all required permissions are authorized.
   */
  const allPermissionsAuthorized = useCallback(() => {
    return REQUIRED_PERMISSIONS.every(
      (type) => permissionStatus[type] === 'authorized'
    );
  }, [permissionStatus]);

  /**
   * Start listening to all devices.
   * Checks permissions first before starting.
   */
  const startListening = useCallback(async () => {
    if (isListeningRef.current) return;

    // Check all permissions first (camera, microphone, bluetooth)
    const allGranted = await ensurePermissions();
    if (!allGranted) {
      console.warn('Required permissions not granted, cannot start listening');
      return;
    }

    Devices.startListening();
    isListeningRef.current = true;

    // Mark all devices as potentially connecting
    AllDevices.forEach((device) => {
      setConnectionStatus(device.slug, 'disconnected');
    });

    // Fire mock readings if not in native shell (for development/testing)
    if (!isRunningInNativeShell()) {
      setTimeout(() => {
        fireMockReadings();
      }, 1000);
    }
  }, [ensurePermissions, setConnectionStatus]);

  /**
   * Stop listening to all devices.
   */
  const stopListening = useCallback(() => {
    if (!isListeningRef.current) return;

    Devices.stopListening();
    isListeningRef.current = false;

    // Mark all devices as disconnected
    AllDevices.forEach((device) => {
      setConnectionStatus(device.slug, 'disconnected');
    });
  }, [setConnectionStatus]);

  useEffect(() => {
    const unsub = Devices.onCatalogState((event) => {
      setDiscoveredDevices(event.devices);

      event.devices.forEach((catalogDevice) => {
        if (!catalogDevice.connected) return;

        const candidates = [
          catalogDevice.identifier,
          catalogDevice.name,
          catalogDevice.meterName,
        ];
        const matchedDevice = AllDevices.find((device) => {
          const expected = normalizeIdentifier(device.identifier);
          return candidates.some(
            (candidate) => normalizeIdentifier(candidate) === expected
          );
        });
        if (matchedDevice) {
          setConnectionStatus(matchedDevice.slug, 'active');
        }
      });
    });

    return unsub;
  }, [setDiscoveredDevices, setConnectionStatus]);

  // Subscribe to device readings
  useEffect(() => {
    const unsubscribers = AllDevices.map((device) =>
      device.onReading((reading) => {
        // Format the reading for display
        const formatted = formatReading(device.slug, reading);

        if (formatted) {
          // Update store with formatted reading
          updateReading(device.slug, {
            value: formatted.value,
            timestamp: formatted.timestamp,
            raw: reading,
          });

          // Mark device as active
          setConnectionStatus(device.slug, 'active');

          // Call external callback if provided
          onReadingReceived?.(device.slug, reading);
        }
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [updateReading, setConnectionStatus, onReadingReceived]);

  // Subscribe to listen state changes
  useEffect(() => {
    const unsub = Devices.onListenState((event: DeviceListenStateEvent) => {
      isListeningRef.current = event.active;
    });

    return unsub;
  }, []);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      startListening();
    }

    return () => {
      if (autoStart) {
        stopListening();
      }
    };
  }, [autoStart, startListening, stopListening]);

  /**
   * Refresh a specific device (re-request reading).
   */
  const refreshDevice = useCallback((slug: string) => {
    // The native bridge doesn't have a "refresh" command per device,
    // but we can clear the reading and wait for a new one
    const device = AllDevices.find((d) => d.slug === slug);
    if (device) {
      device.clearReadings();
    }
  }, []);

  /**
   * Clear all readings and reset state.
   */
  const reset = useCallback(() => {
    clearReadings();
    AllDevices.forEach((device) => {
      device.clearReadings();
      setConnectionStatus(device.slug, 'disconnected');
    });
  }, [clearReadings, setConnectionStatus]);

  /**
   * Open iOS settings for a specific permission (or general app settings).
   */
  const openSettings = useCallback((type?: PermissionType) => {
    Permissions.openSettings(type);
  }, []);

  return {
    // State
    permissionStatus,

    // Actions
    startListening,
    stopListening,
    refreshDevice,
    reset,

    // Permissions
    checkPermission,
    requestPermission,
    ensurePermissions,
    allPermissionsAuthorized,
    openSettings,

    // Available devices
    allDevices: AllDevices,
  };
}

export default useDeviceConnection;
