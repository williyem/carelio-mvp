/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  formatClinicalList,
  formatEmergencyContact,
} from '@/lib/patient-clinical';

interface PatientInfoCardProps {
  patient: any; // Using any for now to handle both types flexibly
}

const PatientInfoCard = ({ patient }: PatientInfoCardProps) => {
  const allergies = formatClinicalList(patient?.allergies);
  const conditions = formatClinicalList(patient?.conditions);
  const emergencyContact = formatEmergencyContact(patient?.emergencyContact);

  const formattedDob = React.useMemo(() => {
    const dob = patient?.dob || patient?.dateOfBirth;
    if (!dob) return 'N/A';

    const date = new Date(dob);
    if (isNaN(date.getTime())) return dob;

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [patient?.dob, patient?.dateOfBirth]);

  return (
    <Card className="border-[#EBEBEB] shadow-none rounded-[14px] overflow-hidden bg-white h-fit">
      <CardContent className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="font-normal text-(--text-secondary)">Name</p>
            <p className="font-bold text-gray-900">
              {patient?.fullName || patient?.name || 'N/A'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-normal text-(--text-secondary)">Date of Birth</p>
            <p className="font-bold text-gray-900">{formattedDob}</p>
          </div>
          <div className="space-y-1">
            <p className="font-normal text-(--text-secondary)">Blood Type</p>
            <p className="font-bold text-gray-900">
              {patient?.bloodType || 'N/A'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-normal text-(--text-secondary)">Allergies</p>
            <p className="font-bold text-gray-900">{allergies}</p>
          </div>
          <div className="space-y-1">
            <p className="font-normal text-(--text-secondary)">
              Medical conditions
            </p>
            <p className="font-bold text-gray-900">{conditions}</p>
          </div>
          <div className="space-y-1">
            <p className="font-normal text-(--text-secondary)">
              Emergency contact
            </p>
            <p className="font-bold text-gray-900">{emergencyContact}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfoCard;
