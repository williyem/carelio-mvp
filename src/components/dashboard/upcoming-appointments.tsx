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
import { Button } from '@/components/ui/button';
import { useGetDoctorAppointments } from '@/integration/appointments';
import { parseISO } from 'date-fns';
import type { Appointment } from '@/integration/appointments/types';
import AppointmentsEmptyState from '@/components/dashboard/appointments-empty-state';
import { isUpcomingAppointment } from '@/lib/appointment-status';

const formatAppointmentDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
  } catch {
    return 'N/A';
  }
};

const formatAppointmentTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';
    const hours24 = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    return `${hours12}:${minutes} ${ampm} GMT`;
  } catch {
    return 'N/A';
  }
};

interface AppointmentCardProps {
  appointment: Appointment;
}

function AppointmentCard({ appointment }: AppointmentCardProps) {
  return (
    <Link href={`/dashboard/appointment/${appointment.id}`} className="block">
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
                {appointment.patient?.fullName ||
                  appointment.patient?.patientId ||
                  'Patient'}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                <div className="flex items-center gap-1.5 text-sm text-(--text-muted) font-medium">
                  <CalendarIcon className="h-3.5 w-3.5 opacity-60" />
                  <span>
                    {appointment.startTime
                      ? formatAppointmentDate(appointment.startTime)
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-(--text-muted) font-medium">
                  <Clock className="h-3.5 w-3.5 opacity-60" />
                  <span>
                    {appointment.startTime
                      ? formatAppointmentTime(appointment.startTime)
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-(--text-muted) group-hover:text-(--text-secondary) transition-colors" />
        </CardContent>
      </Card>
    </Link>
  );
}

export function UpcomingAppointments() {
  const { data, isLoading } = useGetDoctorAppointments({
    limit: 10,
    upcoming: true,
  });

  const upcomingAppointments = React.useMemo(() => {
    const docs = data?.docs;
    if (!docs || docs.length === 0) return [];

    return docs
      .filter((apt) => isUpcomingAppointment(apt))
      .sort((a, b) => {
        if (!a.startTime || !b.startTime) return 0;
        return (
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      })
      .slice(0, 5);
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-(--text-primary)">
          Upcoming Appointments
        </h2>
        {upcomingAppointments.length > 0 && (
          <Link href="/dashboard/appointments">
            <Button
              variant="ghost"
              size="sm"
              className="text-brand-blue hover:text-brand-blue/90"
            >
              View All
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <Card className="border border-(--border-stroke) rounded-2xl overflow-hidden bg-(--bg-white) shadow-none">
          <CardContent className="p-4 sm:p-5 flex items-center justify-center h-20">
            <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />
          </CardContent>
        </Card>
      ) : upcomingAppointments.length > 0 ? (
        <div className="space-y-3">
          {upcomingAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      ) : (
        <AppointmentsEmptyState
          title="No upcoming appointments"
          description="You don't have any upcoming appointments scheduled yet."
        />
      )}
    </div>
  );
}
