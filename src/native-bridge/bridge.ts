import type { BridgeMessage, BridgeListener, NativeBridgeEvent } from './types';

const listeners = new Set<BridgeListener>();

export function send(message: BridgeMessage): void {
  if (typeof window === 'undefined') return;
  window.webkit?.messageHandlers?.nativeBridge?.postMessage(message);
}

export function subscribe(fn: BridgeListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function handleNativeMessage(event: NativeBridgeEvent): void {
  listeners.forEach((fn) => fn(event));
}

export function initNativeBridge(): void {
  if (typeof window === 'undefined') return;
  window.__nativeBridge = { onMessage: handleNativeMessage };
}

export function isRunningInNativeShell(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.webkit?.messageHandlers?.nativeBridge;
}
