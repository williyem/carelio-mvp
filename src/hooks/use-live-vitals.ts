'use client';

import { useEffect, useCallback } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';
import { useLiveVitalsStore } from '@/stores/live-vitals-store';
import type { Vital } from '@/types/vitals.types';

interface UseLiveVitalsOptions {
  appointmentId?: string;
  autoConnect?: boolean;
}

export function useLiveVitals(options: UseLiveVitalsOptions = {}) {
  const { appointmentId, autoConnect = true } = options;

  const {
    vitals,
    allVitals,
    isConnected,
    addVital,
    updateVital,
    setVitals,
    clearVitals,
    setConnected,
    getFormattedVitals,
  } = useLiveVitalsStore();

  const handleNewVital = useCallback(
    (data: { appointmentId: string; vital: Vital }) => {
      // Only process vitals for the current appointment
      if (appointmentId && data.appointmentId !== appointmentId) {
        return;
      }
      addVital(data.vital);
    },
    [appointmentId, addVital]
  );

  const handleVitalUpdated = useCallback(
    (data: { appointmentId: string; vital: Vital }) => {
      if (appointmentId && data.appointmentId !== appointmentId) {
        return;
      }
      updateVital(data.vital);
    },
    [appointmentId, updateVital]
  );

  const handleVitalsConfirmed = useCallback(
    (data: { appointmentId: string; vitalIds: string[] }) => {
      if (appointmentId && data.appointmentId !== appointmentId) {
        return;
      }
      // Vitals have been confirmed - could update status in store if needed
      console.log('Vitals confirmed:', data.vitalIds);
    },
    [appointmentId]
  );

  useEffect(() => {
    if (!autoConnect) return;

    const socket = getSocket();

    const handleConnect = () => {
      console.log('Socket connected');
      setConnected(true);
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setConnected(false);
    };

    const handleConnectError = (error: Error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    };

    // Set up event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('vitals:new', handleNewVital);
    socket.on('vitals:updated', handleVitalUpdated);
    socket.on('vitals:confirmed', handleVitalsConfirmed);

    // Connect (async)
    connectSocket().then(() => {
      // If already connected after auth, set state
      if (socket.connected) {
        setConnected(true);
      }
    });

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('vitals:new', handleNewVital);
      socket.off('vitals:updated', handleVitalUpdated);
      socket.off('vitals:confirmed', handleVitalsConfirmed);
    };
  }, [
    autoConnect,
    handleNewVital,
    handleVitalUpdated,
    handleVitalsConfirmed,
    setConnected,
  ]);

  // Clear vitals when appointment changes
  useEffect(() => {
    if (appointmentId) {
      clearVitals();
    }
  }, [appointmentId, clearVitals]);

  return {
    vitals,
    allVitals,
    isConnected,
    formattedVitals: getFormattedVitals(),
    setVitals,
    clearVitals,
  };
}

export default useLiveVitals;
