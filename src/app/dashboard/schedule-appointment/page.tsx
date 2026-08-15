import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ScheduleAppointmentForm } from '@/components/dashboard/schedule-appointment-form';

export default function ScheduleAppointmentPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-(--text-muted) hover:text-(--text-primary) transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
          Schedule Appointment
        </h1>
      </div>

      <React.Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
          </div>
        }
      >
        <ScheduleAppointmentForm />
      </React.Suspense>
    </div>
  );
}
