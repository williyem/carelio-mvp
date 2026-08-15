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
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGetPatientById } from '@/integration/patient';
import { isForbiddenError } from '@/integration';
import { format, parseISO } from 'date-fns';
import { EmptyState } from '@/components/ui/empty-state';
import BigUserSvg from '@/assets/icons/big-user-svg';
import GenderSvg from '@/assets/icons/gender-svg';
import AppointmentsList from '@/components/dashboard/patients/appointments-list';
import PatientVerificationDialog from '@/components/dashboard/patient-verification-dialog';
import RecordsLockedCard from '@/components/dashboard/records-locked-card';
import { Patient } from '@/types/patient.types';
import { usePatientVerificationStore } from '@/stores/patient-verifcation-store';
import {
  formatClinicalList,
  formatEmergencyContact,
} from '@/lib/patient-clinical';
import {
  PatientClinicalSummaryHeaderButton,
  PatientClinicalSummaryPanel,
  PatientClinicalSummaryProvider,
} from '@/components/dashboard/patient-clinical-summary-card';

export default function PatientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [showVerificationDialog, setShowVerificationDialog] =
    React.useState(false);
  const { setSelectedPatient } = usePatientVerificationStore();

  const {
    data: patient,
    isLoading: isLoadingPatient,
    error,
  } = useGetPatientById(resolvedParams.id);

  const openVerify = () => {
    setSelectedPatient({
      id: resolvedParams.id,
      fullName: patient?.fullName || 'this patient',
      email: patient?.email || '',
    });
    setShowVerificationDialog(true);
  };

  if (isLoadingPatient) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  if (isForbiddenError(error)) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-(--text-muted) hover:text-(--text-primary) transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <RecordsLockedCard onVerify={openVerify} />
        <PatientVerificationDialog
          open={showVerificationDialog}
          onOpenChange={setShowVerificationDialog}
          portal="doctor"
        />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-(--text-muted) hover:text-(--text-primary) transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <Card className="border-(--border-stroke) rounded-2xl">
          <CardContent className="p-4">
            <EmptyState
              icon={<Search className="h-6 w-6 text-(--text-muted)" />}
              title="Patient not found"
              description="This patient may have been removed or you may not have access."
            />
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
    <PatientClinicalSummaryProvider patientId={patient.id}>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="space-y-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-(--text-muted) hover:text-(--text-primary) transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-(--text-primary)">
              Patient Details
            </h1>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <PatientClinicalSummaryHeaderButton />
              <Link
                href={`/dashboard/schedule-appointment?patientId=${patient.id}`}
                className="w-full sm:w-auto"
              >
                <Button className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white rounded-full h-12 px-6 gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Appointment
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Incomplete Profile Banner */}
        {!isLoadingPatient && !patient?.isRegistrationComplete && (
          <div className="theme-alert-warning rounded-2xl p-5 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="h-10 w-10 rounded-full bg-(--bg-white) border border-state-warning-base/35 flex items-center justify-center shrink-0 ">
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
        <Card className="border-(--border-stroke) rounded-2xl overflow-hidden bg-(--bg-white) shadow-none">
          <CardContent className="p-8 space-y-8">
            {/* Basic Info */}
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full border border-(--border-stroke) bg-(--bg-primary) flex items-center justify-center shrink-0">
                <BigUserSvg />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold text-(--text-primary) ">
                  {patient.fullName || 'N/A'}
                </h2>
                <p className="text-(--text-muted) text-sm font-medium">
                  ID: {patient.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Vitals/Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12">
              {/* Row 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-(--text-muted)">
                  <Calendar className="h-4.5 w-4.5 " />
                  <span className="text-sm font-medium ">DOB</span>
                </div>
                <p className="text-[14px] font-medium text-(--text-primary)">
                  {formattedDob}
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-(--text-muted)">
                  <GenderSvg />
                  <span className="text-sm font-medium">Gender</span>
                </div>
                <p className="text-[14px] font-medium text-(--text-primary) capitalize">
                  {patient.gender || 'N/A'}
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-(--text-muted)">
                  <Droplets className="h-4.5 w-4.5 " />
                  <span className="text-sm font-medium">Blood Type</span>
                </div>
                <p className="text-[14px] font-medium text-(--text-primary)">
                  {patient.bloodType || 'N/A'}
                </p>
              </div>

              {/* Row 2 */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-(--text-muted)">
                  <Mail className="h-4.5 w-4.5 " />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <p className="text-[14px] font-medium text-(--text-primary)">
                  {patient.email}
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-(--text-muted)">
                  <Phone className="h-4.5 w-4.5 " />
                  <span className="text-sm font-medium">Phone</span>
                </div>
                <p className="text-[14px] font-medium text-(--text-primary)">
                  {patient.phone || 'N/A'}
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-(--text-muted)">
                  <MapPin className="h-4.5 w-4.5 " />
                  <span className="text-sm font-medium">Address</span>
                </div>
                <p className="text-[14px] font-medium text-(--text-primary)">
                  {patient.address || 'N/A'}
                </p>
              </div>
            </div>

            {/* Special Sections */}
            <div className="space-y-4">
              <div className="bg-state-warning-lighter rounded-xl p-5 space-y-1">
                <h4 className="text-base font-bold text-(--text-primary)">
                  Allergies
                </h4>
                <p className="text-sm text-(--text-muted)">
                  {formatClinicalList(patient.allergies)}
                </p>
              </div>
              <div className="bg-state-warning-lighter rounded-xl p-5 space-y-1">
                <h4 className="text-base font-bold text-(--text-primary)">
                  Medical conditions
                </h4>
                <p className="text-sm text-(--text-muted)">
                  {formatClinicalList(patient.conditions)}
                </p>
              </div>
              <div className="bg-state-warning-lighter rounded-xl p-5 space-y-1">
                <h4 className="text-base font-bold text-(--text-primary)">
                  Emergency contact
                </h4>
                <p className="text-sm text-(--text-muted)">
                  {formatEmergencyContact(patient.emergencyContact)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 min-h-[400px]">
          <PatientClinicalSummaryPanel />
          <AppointmentsList patient={patient as unknown as Patient} />
        </div>
      </div>
    </PatientClinicalSummaryProvider>
  );
}
