import type { NativeBridgeEvent } from '@/native-bridge';

declare global {
  interface Window {
    __nativeBridge?: {
      onMessage(payload: NativeBridgeEvent): void;
    };
    webkit?: {
      messageHandlers?: {
        nativeBridge?: {
          postMessage(message: Record<string, unknown>): void;
        };
      };
    };
  }
}

export {};
