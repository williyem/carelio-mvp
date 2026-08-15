'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  AllDevices,
  Devices,
  type DeviceCatalogEntry,
  NativeDevice,
  Thermometer,
  PulseOx,
  WeightScale,
  Permissions,
  isRunningInNativeShell,
  type PermissionType,
  type PermissionStateEvent,
  type PermissionStatus,
  type DeviceReadingSource,
  type DeviceResultEvent,
  BloodPressure,
  Glucose,
} from '@/native-bridge';
import CloseSvg from '@/assets/icons/close-svg';
import { formatReading } from '@/lib/format-reading';
import { useDeviceGuides } from '@/hooks/use-device-guides';
import {
  guideImage,
  toYouTubeEmbedUrl,
  type DeviceGuide,
} from '@/lib/device-guides';

interface DeviceConfigurationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DeviceLogEntry = {
  id: string;
  timestamp: string;
  message: string;
};

type PermissionStateMap = Partial<
  Record<PermissionType, PermissionStateEvent | null>
>;
type PermissionErrorMap = Partial<Record<PermissionType, string>>;

const DEVICE_PERMISSION_CONFIG: ReadonlyArray<{
  device: NativeDevice<unknown>;
  permissions: ReadonlyArray<PermissionType>;
}> = [
  { device: Thermometer, permissions: ['bluetooth'] },
  { device: WeightScale, permissions: ['bluetooth'] },
  { device: PulseOx, permissions: ['bluetooth'] },
  { device: BloodPressure, permissions: ['bluetooth'] },
  { device: Glucose, permissions: ['bluetooth'] },
];

const LISTENING_MODELS = DEVICE_PERMISSION_CONFIG.map(
  (entry) => entry.device
) as NativeDevice<unknown>[];

const REQUIRED_PERMISSIONS = Array.from(
  new Set(DEVICE_PERMISSION_CONFIG.flatMap((entry) => entry.permissions))
) as PermissionType[];

const ALL_PERMISSIONS: PermissionType[] = ['bluetooth', 'camera', 'microphone'];

const REQUIRED_PERMISSION_SET = new Set<PermissionType>(REQUIRED_PERMISSIONS);

function createInitialPermissionStateMap(): PermissionStateMap {
  return ALL_PERMISSIONS.reduce<PermissionStateMap>((acc, permission) => {
    acc[permission] = null;
    return acc;
  }, {});
}

function formatPermissionLabel(permission: PermissionType): string {
  return permission.charAt(0).toUpperCase() + permission.slice(1);
}

function formatPermissionStatus(status: PermissionStatus): string {
  switch (status) {
    case 'notDetermined':
      return 'Not determined';
    case 'authorized':
      return 'Authorized';
    case 'denied':
      return 'Denied';
    case 'restricted':
      return 'Restricted';
    case 'limited':
      return 'Limited';
    case 'unsupported':
      return 'Unsupported';
    default:
      return status;
  }
}

function normalizeModelToken(value: string | undefined): string {
  return value?.replace(/\s+/g, '').toUpperCase() ?? '';
}

const KNOWN_MODEL_TOKENS = new Set(
  LISTENING_MODELS.map((device) => normalizeModelToken(device.identifier))
);
const KNOWN_MODEL_TOKEN_LIST = Array.from(KNOWN_MODEL_TOKENS).filter(Boolean);

function isKnownCatalogDevice(
  device: Pick<DeviceCatalogEntry, 'name' | 'meterName' | 'identifier'>
): boolean {
  const candidateTokens = [
    normalizeModelToken(device.identifier),
    normalizeModelToken(device.meterName),
    normalizeModelToken(device.name),
  ];
  return candidateTokens.some(
    (token) =>
      token &&
      KNOWN_MODEL_TOKEN_LIST.some((knownToken) => token.includes(knownToken))
  );
}

const DeviceConfigurationSheet = ({
  open,
  onOpenChange,
}: DeviceConfigurationSheetProps) => {
  const [logs, setLogs] = useState<DeviceLogEntry[]>([]);
  const [catalogDevices, setCatalogDevices] = useState<DeviceCatalogEntry[]>(
    []
  );
  const [permissionStates, setPermissionStates] = useState<PermissionStateMap>(
    createInitialPermissionStateMap
  );
  const [permissionErrors, setPermissionErrors] = useState<PermissionErrorMap>(
    {}
  );

  const inNativeShell = isRunningInNativeShell();
  const [mode, setMode] = useState<'ergocart' | 'hospital'>(
    inNativeShell ? 'ergocart' : 'hospital'
  );
  const { data: hospitalGuides } = useDeviceGuides();

  const appendLog = useCallback((message: string) => {
    setLogs((prev) => {
      const entry: DeviceLogEntry = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        timestamp: new Date().toLocaleTimeString(),
        message,
      };
      return [...prev.slice(-49), entry];
    });
  }, []);

  const updatePermissionState = useCallback(
    (event: PermissionStateEvent) => {
      setPermissionStates((prev) => ({
        ...prev,
        [event.permission]: event,
      }));
      setPermissionErrors((prev) => {
        if (!(event.permission in prev)) return prev;
        const next = { ...prev };
        delete next[event.permission];
        return next;
      });
      appendLog(
        `[permissions] ${event.permission} -> ${event.status} (canRequest: ${event.canRequest})`
      );
    },
    [appendLog]
  );

  const updatePermissionError = useCallback(
    (permission: PermissionType, message: string) => {
      setPermissionErrors((prev) => ({
        ...prev,
        [permission]: message,
      }));
      appendLog(`[permissions] ${permission} error: ${message}`);
    },
    [appendLog]
  );

  const readPermissions = useCallback(() => {
    appendLog('[permissions] Checking permissions...');
    ALL_PERMISSIONS.forEach((permission) => {
      Permissions.read(permission);
    });
  }, [appendLog]);

  const allPermissionsAuthorized = useMemo(() => {
    return REQUIRED_PERMISSIONS.every(
      (permission) => permissionStates[permission]?.status === 'authorized'
    );
  }, [permissionStates]);

  const requestablePermissions = useMemo(() => {
    return ALL_PERMISSIONS.filter((permission) => {
      const state = permissionStates[permission];
      if (!state) return false;
      return state.status !== 'authorized' && state.canRequest;
    });
  }, [permissionStates]);

  const blockedPermissions = useMemo(() => {
    return ALL_PERMISSIONS.filter((permission) => {
      const state = permissionStates[permission];
      if (!state) return false;
      return state.status !== 'authorized' && !state.canRequest;
    });
  }, [permissionStates]);

  const requiredBlockedPermissions = useMemo(() => {
    return REQUIRED_PERMISSIONS.filter((permission) => {
      const state = permissionStates[permission];
      if (!state) return false;
      return state.status !== 'authorized' && !state.canRequest;
    });
  }, [permissionStates]);

  const requiredPermissionsLabel = useMemo(() => {
    return REQUIRED_PERMISSIONS.map(formatPermissionLabel).join(', ');
  }, []);

  const requestMissingPermissions = useCallback(() => {
    if (requestablePermissions.length === 0) {
      appendLog('[permissions] No requestable permissions available.');
      return;
    }
    appendLog(`[permissions] Requesting: ${requestablePermissions.join(', ')}`);
    requestablePermissions.forEach((permission) => {
      Permissions.request(permission);
    });
  }, [appendLog, requestablePermissions]);

  const openAppSettings = useCallback(() => {
    if (!isRunningInNativeShell()) {
      appendLog(
        '[permissions] Open Settings is available only inside the native shell.'
      );
      return;
    }
    const preferredPermission =
      blockedPermissions[0] ?? requestablePermissions[0];
    appendLog(
      preferredPermission
        ? `[permissions] Opening settings for ${preferredPermission}...`
        : '[permissions] Opening app settings...'
    );
    Permissions.openSettings(preferredPermission);
  }, [appendLog, blockedPermissions, requestablePermissions]);

  const retryFailedDevice = useCallback(
    (device: DeviceCatalogEntry) => {
      if (!allPermissionsAuthorized) {
        appendLog(
          `[devices] Retry blocked for ${device.id}: required permissions not authorized.`
        );
        return;
      }
      Devices.connect(device.id);
      appendLog(`[devices] Retry requested for ${device.id}`);
    },
    [allPermissionsAuthorized, appendLog]
  );

  useEffect(() => {
    if (!open) return;

    const unsubs = ALL_PERMISSIONS.flatMap((permission) => [
      Permissions.onState(permission, updatePermissionState),
      Permissions.onError(permission, (event) => {
        updatePermissionError(permission, event.message);
      }),
    ]);

    ALL_PERMISSIONS.forEach((permission) => {
      Permissions.read(permission);
    });

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [open, updatePermissionError, updatePermissionState]);

  useEffect(() => {
    if (!open) return;

    const unsub = Devices.onCatalogState((event) => {
      const knownDevices: DeviceCatalogEntry[] = [];
      const unknownDevices: DeviceCatalogEntry[] = [];

      event.devices.forEach((device) => {
        if (isKnownCatalogDevice(device)) {
          knownDevices.push(device);
          return;
        }
        unknownDevices.push(device);
      });

      setCatalogDevices([...knownDevices, ...unknownDevices]);
    });

    return () => {
      unsub();
    };
  }, [open]);

  useEffect(() => {
    if (!open || process.env.NODE_ENV === 'production') return;

    const unsub = Devices.onResult((event: DeviceResultEvent) => {
      const debugEntries = event.debugEntries;
      if (!debugEntries || debugEntries.length === 0) {
        return;
      }

      const selection = event.debugSelection;
      appendLog(
        `[devices.debug] ${event.identifier} deviceId=${event.deviceId} candidates=${debugEntries.length} selectedIndex=${selection?.selectedIndex ?? 'n/a'} reason=${selection?.reason ?? 'n/a'}`
      );

      debugEntries.forEach((entry) => {
        const status = entry.selected ? 'selected' : 'discarded';
        appendLog(
          `[devices.debug] ${event.identifier} ${status} idx=${entry.index} sig=${entry.signature} user=${entry.fetchedUser} pos=${entry.storagePosition ?? 'n/a'} recordedAt=${entry.recordedAt} payload=${JSON.stringify(entry.encodedEntry)}`
        );
      });
    });

    return () => {
      unsub();
    };
  }, [appendLog, open]);

  useEffect(() => {
    if (!open || !allPermissionsAuthorized || mode !== 'ergocart') return;
    if (!isRunningInNativeShell()) return;

    Devices.startListening({ models: LISTENING_MODELS });

    return () => {
      Devices.stopListening();
    };
  }, [open, allPermissionsAuthorized, mode]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-(--bg-primary) w-full sm:w-[400px] md:w-[600px] lg:w-[700px] p-0 overflow-hidden"
      >
        <div className="bg-(--bg-white) border-b border-(--border-stroke) flex flex-col gap-2 sm:gap-[10px] px-3 sm:px-4 py-3 sm:py-[18px]">
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => onOpenChange(false)}
              className="flex gap-2 sm:gap-[10px] items-center text-(--text-primary) text-sm sm:text-[16px] hover:opacity-70 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Back</span>
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center"
            >
              <CloseSvg />
            </button>
          </div>
          <SheetHeader>
            <SheetTitle className="font-bold text-(--text-primary) text-base sm:text-[20px] leading-[1.2] text-left">
              Devices
            </SheetTitle>
            <p className="text-(--text-secondary) text-xs sm:text-sm text-left mt-1">
              Connect ErgoCart meters when available, or follow hospital device
              instructions for standard equipment.
            </p>
          </SheetHeader>
        </div>

        <div className="px-3 sm:px-4 pt-3 flex gap-2 border-b border-(--border-stroke) bg-(--bg-white)">
          <button
            type="button"
            onClick={() => setMode('ergocart')}
            className={`px-3 py-2 text-sm rounded-t-[8px] border border-b-0 ${
              mode === 'ergocart'
                ? 'bg-(--bg-primary) text-(--text-primary) font-medium border-(--border-stroke)'
                : 'text-(--text-secondary) border-transparent'
            }`}
          >
            ErgoCart / Bluetooth
          </button>
          <button
            type="button"
            onClick={() => setMode('hospital')}
            className={`px-3 py-2 text-sm rounded-t-[8px] border border-b-0 ${
              mode === 'hospital'
                ? 'bg-(--bg-primary) text-(--text-primary) font-medium border-(--border-stroke)'
                : 'text-(--text-secondary) border-transparent'
            }`}
          >
            Hospital device guides
          </button>
        </div>

        <ScrollArea className="h-[calc(100vh-160px)] sm:h-[calc(100vh-180px)]">
          <div className="flex flex-col gap-4 sm:gap-[19px] items-start px-3 sm:px-[15px] pb-8 sm:pb-16 py-4 w-full max-w-full sm:max-w-[657px] mx-auto">
            {mode === 'hospital' ? (
              <HospitalDeviceGuides guides={hospitalGuides} />
            ) : !inNativeShell ? (
              <div className="bg-(--bg-white) border border-(--border-stroke) rounded-[10px] p-4 w-full space-y-3">
                <h2 className="font-medium text-(--text-primary) text-base">
                  Connect ErgoCart meters
                </h2>
                <p className="text-(--text-secondary) text-sm">
                  Bluetooth pairing is available in the Carelio native shell on
                  the ErgoCart. Open Devices from that app to grant permissions
                  and connect meters. For standard hospital equipment without a
                  cart, use Hospital device guides.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setMode('hospital')}
                >
                  View hospital device guides
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-(--bg-white) border border-(--border-stroke) rounded-[10px] p-3 sm:p-4 w-full">
                  <h2 className="font-normal leading-[1.2] text-(--text-primary) text-base sm:text-[18px] w-full mb-2">
                    Connect ErgoCart meters
                  </h2>
                  <p className="text-(--text-secondary) text-xs sm:text-[12px] mb-3">
                    {requiredPermissionsLabel} permission
                    {REQUIRED_PERMISSIONS.length > 1 ? 's' : ''} must be
                    authorized before device payload listening starts.
                  </p>

                  <div className="flex flex-col gap-2">
                    {ALL_PERMISSIONS.map((permission) => {
                      const state = permissionStates[permission];
                      const error = permissionErrors[permission];
                      const statusText = error
                        ? `Error: ${error}`
                        : state
                          ? formatPermissionStatus(state.status)
                          : 'Unknown';

                      return (
                        <div
                          key={permission}
                          className="bg-(--bg-primary) border border-(--border-stroke) rounded-[8px] px-3 py-2 flex items-center justify-between gap-2"
                        >
                          <span className="text-(--text-primary) text-xs sm:text-[13px] font-medium">
                            {formatPermissionLabel(permission)}
                            {!REQUIRED_PERMISSION_SET.has(permission) &&
                              ' (optional)'}
                          </span>
                          <span className="text-(--text-secondary) text-[10px] sm:text-[12px] text-right">
                            {statusText}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      type="button"
                      onClick={readPermissions}
                      className="px-3 py-2 rounded-[8px] text-xs sm:text-[12px] bg-(--bg-primary) border border-(--border-stroke) text-(--text-primary) disabled:opacity-60"
                    >
                      Check permissions
                    </button>
                    <button
                      type="button"
                      onClick={requestMissingPermissions}
                      disabled={requestablePermissions.length === 0}
                      className="px-3 py-2 rounded-[8px] text-xs sm:text-[12px] bg-(--bg-success) text-(--text-green) disabled:opacity-60"
                    >
                      Request missing permissions
                    </button>
                    <button
                      type="button"
                      onClick={openAppSettings}
                      className="px-3 py-2 rounded-[8px] text-xs sm:text-[12px] bg-(--bg-primary) border border-(--border-stroke) text-(--text-primary) disabled:opacity-60"
                    >
                      Open app settings
                    </button>
                  </div>

                  {allPermissionsAuthorized ? (
                    <p className="text-(--text-green) text-xs sm:text-[12px] mt-3">
                      All required permissions are authorized. Listening is
                      active.
                    </p>
                  ) : (
                    <p className="text-(--text-secondary) text-xs sm:text-[12px] mt-3">
                      Listening is blocked until all required permissions are
                      authorized.
                    </p>
                  )}

                  {requiredBlockedPermissions.length > 0 && (
                    <p className="text-(--text-secondary) text-xs sm:text-[12px] mt-2">
                      {requiredBlockedPermissions
                        .map((permission) => formatPermissionLabel(permission))
                        .join(', ')}{' '}
                      currently cannot be requested here. Enable them from iOS
                      Settings for this app, then use &quot;Check
                      permissions&quot;.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:gap-[17px] items-start w-full">
                  <h2 className="font-normal leading-[1.2] text-(--text-primary) text-base sm:text-[18px] w-full">
                    Nearby meters
                  </h2>

                  <div className="bg-(--bg-white) border border-(--border-stroke) rounded-[10px] p-3 sm:p-4 w-full">
                    <div className="flex flex-col gap-1 mb-3">
                      <h3 className="font-normal leading-[1.2] text-(--text-primary) text-sm sm:text-[16px]">
                        Nearby Meters
                      </h3>
                      <p className="text-(--text-secondary) text-[10px] sm:text-[12px]">
                        Auto-connect continues for discovered/disconnected
                        devices. Failed devices show a reason and allow manual
                        retry.
                      </p>
                    </div>

                    {catalogDevices.length === 0 ? (
                      <p className="text-(--text-secondary) text-xs sm:text-[12px]">
                        No devices detected yet.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {catalogDevices.map((catalogDevice) => {
                          const normalizedState = catalogDevice.state
                            .trim()
                            .toLowerCase();
                          const isKnownModel =
                            isKnownCatalogDevice(catalogDevice);
                          const isConnected =
                            catalogDevice.connected ||
                            normalizedState === 'connected';
                          const isFailed = normalizedState === 'failed';
                          const modelLabel =
                            catalogDevice.identifier?.trim() ||
                            catalogDevice.meterName?.trim() ||
                            'Unknown model';
                          const rssiLabel =
                            catalogDevice.rssi != null
                              ? `${catalogDevice.rssi} dBm`
                              : 'RSSI unavailable';
                          const badgeClass = isConnected
                            ? 'bg-(--bg-success) text-(--text-green)'
                            : 'bg-(--bg-primary) border border-(--border-stroke) text-(--text-secondary)';

                          return (
                            <div
                              key={catalogDevice.id}
                              className="bg-(--bg-primary) border border-(--border-stroke) rounded-[8px] p-3"
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <p className="text-(--text-primary) text-xs sm:text-[14px] font-medium truncate">
                                    {catalogDevice.name}
                                  </p>
                                  {isKnownModel && (
                                    <p className="text-(--text-secondary) text-[10px] sm:text-[12px] mt-1">
                                      {modelLabel} • {rssiLabel}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span
                                    className={`px-2 py-1 rounded-[20px] text-[10px] sm:text-[12px] whitespace-nowrap ${badgeClass}`}
                                  >
                                    {catalogDevice.state}
                                  </span>
                                  {isFailed && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        retryFailedDevice(catalogDevice)
                                      }
                                      disabled={!allPermissionsAuthorized}
                                      className="px-3 py-1 rounded-[8px] text-[10px] sm:text-[12px] bg-(--bg-success) text-(--text-green) disabled:opacity-60"
                                    >
                                      Retry
                                    </button>
                                  )}
                                </div>
                              </div>

                              {catalogDevice.errorDescription && (
                                <p className="text-(--text-secondary) text-[10px] sm:text-[12px] mt-2">
                                  Reason: {catalogDevice.errorDescription}
                                </p>
                              )}

                              {isKnownModel && (
                                <p className="text-(--text-secondary) text-[10px] mt-2 break-all">
                                  {catalogDevice.id}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 items-start w-full">
                    {AllDevices.map((device) => (
                      <DeviceCard
                        key={device.slug}
                        device={device}
                        onLog={appendLog}
                        canListen={allPermissionsAuthorized}
                      />
                    ))}
                  </div>
                </div>

                {process.env.NODE_ENV !== 'production' && (
                  <div className="flex flex-col gap-2 sm:gap-3 items-start w-full">
                    <h2 className="font-normal leading-[1.2] text-(--text-primary) text-base sm:text-[18px] w-full">
                      Temporary Logs
                    </h2>
                    <div className="bg-(--bg-white) border border-(--border-stroke) rounded-[10px] p-3 sm:p-4 w-full max-h-[240px] overflow-y-auto">
                      {logs.length === 0 ? (
                        <p className="text-(--text-secondary) text-xs sm:text-[12px]">
                          No logs yet.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {[...logs].reverse().map((entry) => (
                            <div
                              key={entry.id}
                              className="text-xs sm:text-[12px]"
                            >
                              <span className="text-(--text-secondary)">
                                [{entry.timestamp}]
                              </span>{' '}
                              <span className="text-(--text-primary)">
                                {entry.message}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

function HospitalDeviceGuides({ guides }: { guides: DeviceGuide[] }) {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="space-y-1">
        <h2 className="font-medium text-(--text-primary) text-base sm:text-lg">
          Hospital device instructions
        </h2>
        <p className="text-(--text-secondary) text-sm">
          Use these when the clinic has standard meters (no ErgoCart). Photos,
          steps, and optional YouTube how-tos are managed in Admin → Devices.
        </p>
      </div>
      {guides.length === 0 ? (
        <p className="text-(--text-secondary) text-sm">
          No active device guides yet.
        </p>
      ) : (
        guides.map((guide) => {
          const embed = toYouTubeEmbedUrl(guide.youtubeUrl);
          const open = expandedSlug === guide.slug;
          return (
            <div
              key={guide.slug}
              className="bg-(--bg-white) border border-(--border-stroke) rounded-[10px] p-3 sm:p-4 w-full space-y-3"
            >
              <div className="flex gap-3 items-start">
                <div className="relative size-16 rounded-[8px] overflow-hidden bg-(--bg-light-gray) shrink-0 border border-(--border-stroke)">
                  {guideImage(guide) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={guideImage(guide)}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-medium text-(--text-primary)">
                    {guide.title}
                  </p>
                  <p className="text-xs text-(--text-secondary)">
                    {guide.shortLabel}
                  </p>
                  <p className="text-sm text-(--text-secondary) line-clamp-2">
                    {guide.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setExpandedSlug(open ? null : guide.slug)}
                >
                  {open ? 'Hide steps' : 'Show steps'}
                </Button>
                {guide.youtubeUrl ? (
                  <a
                    href={guide.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-brand-blue hover:underline px-2"
                  >
                    <ExternalLink className="size-3.5" />
                    Watch how to use
                  </a>
                ) : null}
              </div>
              {open ? (
                <div className="space-y-3 border-t border-(--border-stroke) pt-3">
                  {embed ? (
                    <div className="aspect-video w-full overflow-hidden rounded-[8px] bg-black">
                      <iframe
                        title={`${guide.title} how-to`}
                        src={embed}
                        className="size-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : null}
                  {guide.tips.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-(--text-secondary) mb-1">
                        Tips
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-sm text-(--text-primary)">
                        {guide.tips.map((tip) => (
                          <li key={tip}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-(--text-secondary) mb-1">
                      Steps
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-sm text-(--text-primary)">
                      {guide.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}

interface DeviceCardProps {
  device: NativeDevice<unknown>;
  onLog: (message: string) => void;
  canListen: boolean;
}

const DeviceCard = ({ device, onLog, canListen }: DeviceCardProps) => {
  const [lastReading, setLastReading] = useState<{
    value: string;
    timestamp: string;
  } | null>(null);
  const [latestPayload, setLatestPayload] = useState<string | null>(null);

  const handleReading = useCallback(
    (reading: unknown, source: DeviceReadingSource) => {
      const formatted = formatReading(device.slug, reading);
      if (formatted) {
        setLastReading(formatted);
      }
      setLatestPayload(JSON.stringify(reading, null, 2));
      onLog(
        `[${device.identifier}] reading received (deviceId=${source.deviceId}, eventDate=${source.eventDate}): ${JSON.stringify(reading)}`
      );
    },
    [device.slug, device.identifier, onLog]
  );

  useEffect(() => {
    if (!canListen) return;
    const unsub = device.onReading(handleReading);
    return unsub;
  }, [canListen, device, handleReading]);

  const Icon = device.icon;
  const hasReading = !!lastReading;

  return (
    <div
      className={`bg-(--bg-white) border border-(--border-stroke) flex flex-col gap-3 sm:gap-[14px] items-start px-3 sm:px-5 py-3 sm:py-[15px] rounded-[10px] w-full ${
        canListen ? '' : 'opacity-60'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 w-full">
        <div className="flex gap-2 sm:gap-[10px] items-center flex-1 min-w-0">
          <div
            className={`flex items-center justify-center p-2 sm:p-[10px] rounded-full shrink-0 ${
              hasReading ? 'bg-(--bg-success)' : 'bg-(--bg-light-gray)'
            }`}
          >
            <div className="w-4 h-4 sm:w-5 sm:h-5 text-(--text-primary)">
              <Icon />
            </div>
          </div>
          <div className="flex gap-2 sm:gap-[10px] items-center flex-1 min-w-0">
            <div className="flex items-center min-w-0 flex-1 sm:w-[93px]">
              <span className="font-bold leading-[1.2] text-(--text-primary) text-xs sm:text-[14px] truncate">
                {device.name}
              </span>
            </div>
            {!canListen && (
              <div className="flex items-center justify-center px-2 sm:px-[10px] py-1 sm:py-[5px] rounded-[20px] shrink-0 bg-(--bg-primary) border border-(--border-stroke)">
                <span className="font-normal leading-[1.2] text-[10px] sm:text-[12px] whitespace-nowrap text-(--text-secondary)">
                  Inactive
                </span>
              </div>
            )}
            {canListen && hasReading && (
              <div className="flex items-center justify-center px-2 sm:px-[10px] py-1 sm:py-[5px] rounded-[20px] shrink-0 bg-(--bg-success)">
                <span className="font-normal leading-[1.2] text-[10px] sm:text-[12px] whitespace-nowrap text-(--text-green)">
                  Reading received
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {lastReading && (
        <div className="flex flex-col items-start justify-center pl-8 sm:pl-10 pr-0 py-0 w-full">
          <div className="bg-(--bg-primary) border border-(--border-stroke) flex flex-col gap-2 sm:gap-[10px] items-start justify-center p-2 sm:p-[10px] rounded-[8px] w-full">
            <p className="font-normal leading-[1.2] text-(--text-secondary) text-[10px] sm:text-[12px] w-full">
              Last Reading
            </p>
            <div className="flex items-center w-full sm:w-[186px]">
              <div className="flex flex-col gap-1 sm:gap-[2px] items-start leading-[1.2]">
                <p className="font-bold text-(--text-primary) text-sm sm:text-[16px]">
                  {lastReading.value}
                </p>
                <p className="font-normal text-(--text-secondary) text-[10px] sm:text-[12px]">
                  {lastReading.timestamp}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {latestPayload && (
        <div className="flex flex-col items-start justify-center pl-8 sm:pl-10 pr-0 py-0 w-full">
          <div className="bg-(--bg-primary) border border-(--border-stroke) p-2 sm:p-[10px] rounded-[8px] w-full">
            <p className="font-normal leading-[1.2] text-(--text-secondary) text-[10px] sm:text-[12px] w-full mb-2">
              Latest Raw Payload
            </p>
            <pre className="text-[10px] sm:text-[11px] leading-[1.4] text-(--text-primary) whitespace-pre-wrap break-all">
              {latestPayload}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceConfigurationSheet;
