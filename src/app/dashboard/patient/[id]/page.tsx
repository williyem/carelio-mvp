'use client';

import * as React from 'react';
import Link from 'next/link';
import { use } from 'react';
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Droplets,
  Info,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGetPatientById } from '@/integration/patient';
import { format, parseISO } from 'date-fns';
import BigUserSvg from '@/assets/icons/big-user-svg';
import GenderSvg from '@/assets/icons/gender-svg';
import AppointmentsList from '@/components/dashboard/patients/appointments-list';
import { Patient } from '@/types/patient.types';

export default function PatientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  const {
    data: patient,
    isLoading: isLoadingPatient,
    error,
  } = useGetPatientById(resolvedParams.id);

  if (isLoadingPatient) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <Card className="border-gray-100 rounded-2xl">
          <CardContent className="p-8 text-center text-gray-500">
            Patient not found
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format DOB
  const formattedDob = patient.dob
    ? format(parseISO(patient.dob), 'MMMM d, yyyy')
    : 'N/A';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold  text-gray-900">
            Patient Details
          </h1>
          <Link
            href={`/dashboard/schedule-appointment?patientId=${patient.id}`}
            className="w-full sm:w-auto"
          >
            <Button className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white rounded-full h-12 px-6 gap-2 ">
              <Calendar className="h-4 w-4" />
              Schedule Appointment
            </Button>
          </Link>
        </div>
      </div>
      {/* Incomplete Profile Banner */}
      {!isLoadingPatient && !patient?.isRegistrationComplete && (
        <div className="bg-[#FDFAE7] border border-[#FFE0A3] rounded-2xl p-5 flex items-center gap-4 text-gray-900 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="h-10 w-10 rounded-full bg-white border border-[#FFE0A3] flex items-center justify-center shrink-0 ">
            <Info className="h-5 w-5 text-amber-600" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-[15px] font-bold">Registration Incomplete</h4>
            <p className="text-sm text-amber-900">
              The patient has not completed registration and is yet to sign
              consent form
            </p>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <Card className="border-[#EBEBEB] rounded-2xl overflow-hidden bg-white shadow-none">
        <CardContent className="p-8 space-y-8">
          {/* Basic Info */}
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full border border-[#EBEBEB] bg-gray-50 flex items-center justify-center shrink-0">
              <BigUserSvg />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xl font-bold text-gray-900 ">
                {patient.fullName || 'N/A'}
              </h2>
              <p className="text-[#80898E] text-sm font-medium">
                ID: {patient.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Vitals/Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12">
            {/* Row 1 */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[#80898E]">
                <Calendar className="h-4.5 w-4.5 " />
                <span className="text-sm font-medium ">DOB</span>
              </div>
              <p className="text-[14px] font-medium text-gray-900">
                {formattedDob}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[#80898E]">
                <GenderSvg />
                <span className="text-sm font-medium">Gender</span>
              </div>
              <p className="text-[14px] font-medium text-gray-900 capitalize">
                {patient.gender || 'N/A'}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[#80898E]">
                <Droplets className="h-4.5 w-4.5 " />
                <span className="text-sm font-medium">Blood Type</span>
              </div>
              <p className="text-[14px] font-medium text-gray-900">
                {patient.bloodType || 'N/A'}
              </p>
            </div>

            {/* Row 2 */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[#80898E]">
                <Mail className="h-4.5 w-4.5 " />
                <span className="text-sm font-medium">Email</span>
              </div>
              <p className="text-[14px] font-medium text-gray-900">
                {patient.email}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[#80898E]">
                <Phone className="h-4.5 w-4.5 " />
                <span className="text-sm font-medium">Phone</span>
              </div>
              <p className="text-[14px] font-medium text-gray-900">
                {patient.phone || 'N/A'}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[#80898E]">
                <MapPin className="h-4.5 w-4.5 " />
                <span className="text-sm font-medium">Address</span>
              </div>
              <p className="text-[14px] font-medium text-gray-900">
                {patient.address || 'N/A'}
              </p>
            </div>
          </div>

          {/* Special Sections */}
          <div className="space-y-4">
            <div className="bg-[#FDFAE7] rounded-xl p-5 space-y-1">
              <h4 className="text-base font-bold text-gray-900">Allergies</h4>
              <p className="text-sm text-gray-500">
                {patient.allergies || 'None reported'}
              </p>
            </div>
            <div className="bg-[#EBF5FF] rounded-xl p-5 space-y-1">
              <h4 className="text-base font-bold text-gray-900">
                Chief Complaint
              </h4>
              <p className="text-sm text-brand-blue font-medium">
                {patient.chiefComplaint || 'None reported'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="min-h-[400px]">
        <AppointmentsList patient={patient as unknown as Patient} />
      </div>
    </div>
  );
}
