'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronRight,
  User,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useGetRecentAppointments } from '@/integration/appointments';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import AppointmentsEmptyState from '@/components/dashboard/appointments-empty-state';

const formatDuration = (
  startTime: string | undefined,
  endTime: string | undefined
): string => {
  if (!startTime || !endTime) return '30 mins';
  try {
    const mins = differenceInMinutes(parseISO(endTime), parseISO(startTime));
    if (!Number.isFinite(mins) || mins < 0) return '30 mins';
    return `${mins} mins`;
  } catch {
    return '30 mins';
  }
};

export function RecentConsultation() {
  const { data, isLoading } = useGetRecentAppointments();

  const recentConsultation = React.useMemo(() => {
    const docs = data?.docs;
    if (!docs || docs.length === 0) return null;

    const completed = docs.filter(
      (apt) => apt.status?.toUpperCase() === 'COMPLETED'
    );
    if (completed.length === 0) return null;

    return completed[0]; // Assuming sorted by backend
  }, [data]);

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-(--text-primary)">
        Recent Consultation
      </h2>
      {isLoading ? (
        <Card className="border border-(--border-stroke) rounded-2xl overflow-hidden bg-(--bg-white) shadow-none">
          <CardContent className="p-4 sm:p-5 flex items-center justify-center h-20">
            <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />
          </CardContent>
        </Card>
      ) : recentConsultation ? (
        <Link
          href={`/dashboard/patient/${recentConsultation.patientId}/${recentConsultation?.id}`}
          className="block"
        >
          <Card className="border border-(--border-stroke) rounded-2xl overflow-hidden cursor-pointer bg-(--bg-white) transition-colors hover:bg-(--bg-primary)/50 shadow-none">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border border-blue-50">
                  <AvatarFallback className="bg-blue-50 text-brand-blue">
                    <User className="h-6 w-6" strokeWidth={1.5} />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-(--text-primary) leading-tight">
                    {recentConsultation.patient?.fullName ||
                      recentConsultation.patient?.patientId ||
                      'Patient'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                    <div className="flex items-center gap-1.5 text-sm text-(--text-muted) font-medium">
                      <CalendarIcon className="h-3.5 w-3.5 opacity-60" />
                      <span>
                        {recentConsultation.startTime
                          ? format(
                              parseISO(recentConsultation.startTime),
                              'MMM d, yyyy'
                            )
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-(--text-muted) font-medium">
                      <Clock className="h-3.5 w-3.5 opacity-60" />
                      <span>
                        {formatDuration(
                          recentConsultation.startTime,
                          recentConsultation.endTime
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-(--text-muted) group-hover:text-(--text-secondary) transition-colors" />
            </CardContent>
          </Card>
        </Link>
      ) : (
        <AppointmentsEmptyState
          title="No recent consultations"
          description="Completed consultations will appear here after your first visit."
        />
      )}
    </div>
  );
}
