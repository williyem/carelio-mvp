'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useVideoCallStore } from '@/stores/video-call-store';
import {
  isClinicianCallRole,
  readPortalIdentity,
  type CallParticipantRole,
} from '@/lib/call-join';

export type { CallParticipantRole };

export function useCallParticipantRole(): {
  role: CallParticipantRole | null;
  isLoading: boolean;
} {
  const pathname = usePathname();
  const storedRole = useVideoCallStore((state) => state.participantRole);

  const role = useMemo((): CallParticipantRole | null => {
    if (storedRole) return storedRole;
    return readPortalIdentity(pathname)?.role ?? null;
  }, [pathname, storedRole]);

  return { role, isLoading: false };
}

export function isStaffRole(role: CallParticipantRole | null) {
  return isClinicianCallRole(role);
}
