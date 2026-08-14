'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppointmentsScheduler } from '@/components/dashboard/appointments-scheduler';
import { PatientSearch } from '@/components/dashboard/patient-search';
import { RecentConsultation } from '@/components/dashboard/recent-consultation';
import AddPatientSvg from '@/assets/icons/add-patient-svg';
import NewAppointmentSvg from '@/assets/icons/new-appointment-svg';

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      {/* Welcome and Search */}
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold leading-[1.2] tracking-tight text-[#020f17]">
            Welcome back
          </h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link href="/dashboard/schedule-appointment">
              <Button
                variant="outline"
                className="h-11 w-full sm:w-[168px] rounded-full border-[#1792e6] bg-white px-4 py-2.5 text-sm font-normal text-[#1692e5] hover:bg-brand-blue/5 hover:text-[#1692e5]"
              >
                <NewAppointmentSvg color="#1692E5" />
                New Appointment
              </Button>
            </Link>
            <Link href="/dashboard/add-patient">
              <Button className="text-white cursor-pointer h-[44px] border border-brand-blue bg-brand-blue w-[158px] hover:text-gray-50 rounded-full px-6 py-3 font-normal text-sm flex items-center gap-2 transition-colors">
                <div className="relative">
                  <AddPatientSvg />
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-brand-blue rounded-full" />
                </div>
                New Patient
              </Button>
            </Link>
          </div>
        </div>

        <PatientSearch />
      </div>

      <RecentConsultation />

      {/* Appointments Schedule */}
      <AppointmentsScheduler />
    </div>
  );
}
