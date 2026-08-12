'use client';

import { useRouter } from 'nextjs-toploader/app';
import { format } from 'date-fns';
import BackButton from '@/components/dashboard/back-button';
import { ROUTES } from '@/lib/routes';
import CalendarSvg from '@/assets/icons/calendar-svg';

interface VitalRecord {
  id: string;
  date: Date;
  heartRate: string;
  bloodPressure: string; // Format: "120/80"
  temperature: string;
  oxygenSaturation: string;
}

const VitalHistoryPage = () => {
  const router = useRouter();

  // TODO: Fetch vital records from API
  // For now, using mock data
  const vitalRecords: VitalRecord[] = [
    {
      id: '1',
      date: new Date('2025-12-04'),
      heartRate: '72 bpm',
      bloodPressure: '120/80',
      temperature: '98.6°F',
      oxygenSaturation: '98%',
    },
    {
      id: '2',
      date: new Date('2025-12-03'),
      heartRate: '72 bpm',
      bloodPressure: '120/80',
      temperature: '98.6°F',
      oxygenSaturation: '98%',
    },
    {
      id: '3',
      date: new Date('2025-12-02'),
      heartRate: '72 bpm',
      bloodPressure: '120/80',
      temperature: '98.6°F',
      oxygenSaturation: '98%',
    },
    {
      id: '4',
      date: new Date('2025-12-01'),
      heartRate: '72 bpm',
      bloodPressure: '120/80',
      temperature: '98.6°F',
      oxygenSaturation: '98%',
    },
  ];

  const handleBack = () => {
    router.push(ROUTES.PATIENT.RECORD_VITALS);
  };

  return (
    <div className="flex flex-col gap-[15px] items-start pt-4 sm:pt-10 px-4 sm:px-0 w-full max-w-[900px] mx-auto">
      <BackButton onClick={handleBack} />

      <div className="flex flex-col gap-[20px] items-start w-full">
        <h1 className="font-bold leading-[1.2] text-(--text-primary) text-[20px] sm:text-[24px]">
          Vital History
        </h1>

        <div className="flex flex-col gap-[16px] items-start w-full">
          {vitalRecords.map((record) => (
            <div
              key={record.id}
              className="border border-(--border-stroke) flex flex-col gap-[16px] items-start px-5 py-[15px] rounded-[10px] w-full"
            >
              <p className="font-bold leading-[1.2] text-(--text-primary) text-[16px] w-full">
                Vitals Summary
              </p>

              {/* Date */}
              <div className="flex items-start">
                <div className="flex gap-[5px] items-center">
                  <div className="size-[18px]">
                    <CalendarSvg color="#1485d0" />
                  </div>
                  <p className="font-normal leading-[1.2] text-(--brand-blue-text) text-[14px]">
                    {format(record.date, 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Vitals List */}
              <div className="flex flex-col gap-[14px] items-start w-full">
                <div className="flex gap-1 items-center w-full">
                  <p className="flex-1 font-normal leading-[1.2] text-(--text-secondary) text-[14px]">
                    Heart Rate
                  </p>
                  <p className="flex-1 font-bold leading-[1.2] text-(--text-primary) text-[14px]">
                    {record.heartRate}
                  </p>
                </div>
                <div className="flex gap-1 items-center w-full">
                  <p className="flex-1 font-normal leading-[1.2] text-(--text-secondary) text-[14px]">
                    Blood Pressure
                  </p>
                  <p className="flex-1 font-bold leading-[1.2] text-(--text-primary) text-[14px]">
                    {record.bloodPressure}
                  </p>
                </div>
                <div className="flex gap-1 items-center w-full">
                  <p className="flex-1 font-normal leading-[1.2] text-(--text-secondary) text-[14px]">
                    Temperature
                  </p>
                  <p className="flex-1 font-bold leading-[1.2] text-(--text-primary) text-[14px]">
                    {record.temperature}
                  </p>
                </div>
                <div className="flex gap-1 items-center w-full">
                  <p className="flex-1 font-normal leading-[1.2] text-(--text-secondary) text-[14px]">
                    Oxygen (O₂)
                  </p>
                  <p className="flex-1 font-bold leading-[1.2] text-(--text-primary) text-[14px]">
                    {record.oxygenSaturation}
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
