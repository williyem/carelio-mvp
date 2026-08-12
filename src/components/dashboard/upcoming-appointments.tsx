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
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import type { Appointment } from '@/integration/appointments/types';

const formatAppointmentDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  } catch {
    return 'N/A';
  }
};

const formatAppointmentTime = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'h:mm a');
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
      <Card className="border border-gray-100 rounded-2xl overflow-hidden cursor-pointer bg-white transition-colors hover:bg-gray-50/50 shadow-none">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border border-blue-50">
              <AvatarFallback className="bg-blue-50 text-brand-blue">
                <User className="h-6 w-6" strokeWidth={1.5} />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">
                {appointment.patient?.fullName ||
                  appointment.patient?.patientId ||
                  'Patient'}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                  <CalendarIcon className="h-3.5 w-3.5 opacity-60" />
                  <span>
                    {appointment.startTime
                      ? formatAppointmentDate(appointment.startTime)
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
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
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </CardContent>
      </Card>
    </Link>
  );
}

export function UpcomingAppointments() {
  const { data, isLoading } = useGetDoctorAppointments({
    limit: 3,
  });

  const upcomingAppointments = React.useMemo(() => {
    const docs = data?.docs;
    if (!docs || docs.length === 0) return [];

    return docs
      .filter((apt) => {
        if (!apt.startTime) return false;
        try {
          return new Date(apt.startTime) > new Date();
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        if (!a.startTime || !b.startTime) return 0;
        return (
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      })
      .slice(0, 5); // Limit to 5 appointments
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">
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
        <Card className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-none">
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
        <Card className="border border-gray-100 border-dashed rounded-2xl overflow-hidden bg-white shadow-none">
          <CardContent className="p-4 sm:p-5 flex items-center justify-center h-20 text-gray-500 text-sm">
            No upcoming appointments scheduled
          </CardContent>
        </Card>
      )}
    </div>
  );
}
