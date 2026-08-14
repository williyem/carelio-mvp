'use client';

import { useMemo } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import BackButton from '@/components/dashboard/back-button';
import { ROUTES } from '@/lib/routes';
import CalendarSvg from '@/assets/icons/calendar-svg';
import { usePatientSession } from '@/integration/auth/patient';
import { usePatientVitalsStore } from '@/stores/patient-vitals-store';

const VitalHistoryPage = () => {
  const router = useRouter();
  const { data: session } = usePatientSession();
  const patientId = session?.user?.id;
  const allEntries = usePatientVitalsStore((s) => s.entries);
  const entries = useMemo(
    () =>
      patientId
        ? allEntries.filter((entry) => entry.patientId === patientId)
        : [],
    [allEntries, patientId]
  );

  return (
    <div className="flex flex-col gap-[15px] items-start pt-4 sm:pt-10 px-4 sm:px-0 w-full max-w-[900px] mx-auto">
      <BackButton onClick={() => router.push(ROUTES.PATIENT.ROOT)} />

      <div className="flex flex-col gap-[20px] items-start w-full">
        <h1 className="font-bold leading-[1.2] text-(--text-primary) text-[20px] sm:text-[24px]">
          Vital History
        </h1>

        {entries.length === 0 && (
          <p className="text-sm text-(--text-secondary)">
            No vitals recorded yet. Readings you submit stay pending until a
            doctor confirms them in the visit.
          </p>
        )}

        <div className="flex flex-col gap-[16px] items-start w-full">
          {entries.map((record) => (
            <div
              key={record.id}
              className="border border-(--border-stroke) flex flex-col gap-[16px] items-start px-5 py-[15px] rounded-[10px] w-full"
            >
              <div className="flex items-center justify-between w-full">
                <p className="font-bold leading-[1.2] text-(--text-primary) text-[16px]">
                  Vitals Summary
                </p>
                <span className="text-xs capitalize text-brand-blue">
                  {record.status}
                </span>
              </div>

              <div className="flex items-start">
                <div className="flex gap-[5px] items-center">
                  <div className="size-[18px]">
                    <CalendarSvg color="#1485d0" />
                  </div>
                  <p className="font-normal leading-[1.2] text-(--brand-blue-text) text-[14px]">
                    {record.recordedAt}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-[14px] items-start w-full">
                <div className="flex gap-1 items-center w-full">
                  <p className="flex-1 font-normal text-(--text-secondary) text-[14px]">
                    Heart Rate
                  </p>
                  <p className="flex-1 font-bold text-(--text-primary) text-[14px]">
                    {record.heartRate} bpm
                  </p>
                </div>
                <div className="flex gap-1 items-center w-full">
                  <p className="flex-1 font-normal text-(--text-secondary) text-[14px]">
                    Blood Pressure
                  </p>
                  <p className="flex-1 font-bold text-(--text-primary) text-[14px]">
                    {record.systolic}/{record.diastolic}
                  </p>
                </div>
                <div className="flex gap-1 items-center w-full">
                  <p className="flex-1 font-normal text-(--text-secondary) text-[14px]">
                    Temperature
                  </p>
                  <p className="flex-1 font-bold text-(--text-primary) text-[14px]">
                    {record.temperature}°F
                  </p>
                </div>
                <div className="flex gap-1 items-center w-full">
                  <p className="flex-1 font-normal text-(--text-secondary) text-[14px]">
                    Oxygen (O₂)
                  </p>
                  <p className="flex-1 font-bold text-(--text-primary) text-[14px]">
                    {record.oxygenSaturation}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VitalHistoryPage;
