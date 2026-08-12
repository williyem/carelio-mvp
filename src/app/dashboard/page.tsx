'use client';

import * as React from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppointmentsScheduler } from '@/components/dashboard/appointments-scheduler';
import { PatientSearch } from '@/components/dashboard/patient-search';
import { RecentConsultation } from '@/components/dashboard/recent-consultation';
import { UpcomingAppointments } from '@/components/dashboard/upcoming-appointments';
import AddPatientSvg from '@/assets/icons/add-patient-svg';

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      {/* Welcome and Search */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h1>
          <div className="relative">
            <button className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand-blue text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
              5
            </span>
          </div>
        </div>

        <PatientSearch />

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard/schedule-appointment" className="flex-1">
            <Button className="w-full h-14 rounded-full bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold text-base  ">
              <CalendarIcon className="mr-2 h-5 w-5 text-white/80" />
              Schedule Appointment
            </Button>
          </Link>
          <Link href="/dashboard/add-patient" className="flex-1">
            <Button
              variant="outline"
              className="w-full h-14 rounded-full border-blue-200 text-brand-blue hover:bg-blue-50 hover:text-brand-blue/90 font-semibold text-base"
            >
              <AddPatientSvg />
              Add Patient
            </Button>
          </Link>
        </div>
      </div>

      {/* Upcoming Appointments */}
      {/* <UpcomingAppointments /> */}

      <RecentConsultation />

      {/* Appointments Schedule */}
      <AppointmentsScheduler />
    </div>
  );
}
