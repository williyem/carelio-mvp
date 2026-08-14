'use client';

import { Calendar, Mail, Phone, MapPin, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';
import BigUserSvg from '@/assets/icons/big-user-svg';
import GenderSvg from '@/assets/icons/gender-svg';
import { Patient } from '@/integration/patient';
import PatientClinicalIntake from '@/components/dashboard/patient-clinical-intake';

interface PatientInfoCardProps {
  patient: Patient;
  className?: string;
}

const PatientInfoCard = ({ patient, className }: PatientInfoCardProps) => {
  return (
    <div
      className={cn(
        'border border-(--border-stroke) flex flex-col gap-4 sm:gap-5 items-start px-4 sm:px-5 py-4 sm:py-[23px] rounded-[10px] w-full',
        className
      )}
    >
      {/* Patient Name and ID */}
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-1 gap-2 sm:gap-[10px] items-start">
          <div className="bg-(--bg-light-gray) relative rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
            <div className="w-6 h-6 sm:w-6 sm:h-6">
              <BigUserSvg />
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-1 sm:gap-[6px] items-start min-w-0">
            <h2 className="font-bold leading-[1.2] text-(--text-primary) text-sm sm:text-[16px] truncate w-full">
              {patient.fullName}
            </h2>
            <p className="font-normal leading-[1.2] text-(--text-secondary) text-xs sm:text-[14px]">
              ID: {patient.patientId}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Details Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 w-full">
        {/* DOB */}
        <div className="flex flex-col items-start">
          <div className="flex gap-2 h-6 items-center w-full">
            <Calendar className="w-4 h-4 text-(--text-muted)" />
            <p className="font-medium leading-[20px] text-sm sm:text-[14px] text-(--text-muted)">
              DOB
            </p>
          </div>
          <div className="flex h-6 items-center w-full">
            <p className="flex-1 font-medium leading-[24px] text-sm sm:text-[14px] text-(--text-dark)">
              {patient.dateOfBirth}
            </p>
          </div>
        </div>

        {/* Gender */}
        <div className="flex flex-col items-start">
          <div className="flex gap-2 h-6 items-center w-full">
            <GenderSvg />
            <p className="font-medium leading-[20px] text-sm sm:text-[14px] text-(--text-muted)">
              Gender
            </p>
          </div>
          <div className="flex h-6 items-center w-full">
            <p className="flex-1 font-medium leading-[24px] text-sm sm:text-[14px] text-(--text-dark)">
              {patient.gender}
            </p>
          </div>
        </div>

        {/* Blood Type */}
        <div className="flex flex-col gap-[3px] items-start">
          <div className="flex gap-2 h-6 items-center w-full">
            <Droplets className="w-4 h-4 text-(--text-muted)" />
            <p className="font-medium leading-[20px] text-sm sm:text-[14px] text-(--text-muted)">
              Blood Type
            </p>
          </div>
          <div className="flex h-6 items-center w-full">
            <p className="flex-1 font-medium leading-[24px] text-sm sm:text-[14px] text-(--text-dark)">
              {patient.bloodType}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Details Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 w-full">
        {/* Email */}
        <div className="flex flex-col items-start">
          <div className="flex h-6 items-center w-full">
            <div className="flex flex-1 gap-2 items-center">
              <Mail className="w-4 h-4 text-(--text-muted)" />
              <p className="font-medium leading-[20px] text-sm sm:text-[14px] text-(--text-muted)">
                Email
              </p>
            </div>
          </div>
          <div className="flex h-6 items-center w-full">
            <p className="flex-1 font-medium leading-[24px] text-sm sm:text-[14px] text-(--text-dark) wrap-break-word">
              {patient.email}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex flex-col items-start">
          <div className="flex gap-2 h-6 items-center w-full">
            <Phone className="w-4 h-4 text-(--text-muted)" />
            <p className="font-medium leading-[20px] text-sm sm:text-[14px] text-(--text-muted)">
              Phone
            </p>
          </div>
          <div className="flex h-6 items-center w-full">
            <p className="flex-1 font-medium leading-[24px] text-sm sm:text-[14px] text-(--text-dark)">
              {patient.phone}
            </p>
          </div>
        </div>

        {/* Address */}
        <div className="flex flex-col gap-[3px] items-start">
          <div className="flex gap-2 h-6 items-center w-full">
            <MapPin className="w-4 h-4 text-(--text-muted)" />
            <p className="font-medium leading-[20px] text-sm sm:text-[14px] text-(--text-muted)">
              Address
            </p>
          </div>
          <div className="flex h-6 items-center w-full">
            <p className="flex-1 font-medium leading-[24px] text-sm sm:text-[14px] text-(--text-dark) wrap-break-word">
              {patient.address}
            </p>
          </div>
        </div>
      </div>

      <PatientClinicalIntake
        allergies={patient.allergies}
        conditions={patient.conditions}
        emergencyContact={patient.emergencyContact}
      />
    </div>
  );
};

export default PatientInfoCard;
