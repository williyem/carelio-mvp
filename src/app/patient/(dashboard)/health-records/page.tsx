'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { ROUTES } from '@/lib/routes';
import BackButton from '@/components/dashboard/back-button';
import HealthRecordsList from '@/components/dashboard/health-records-list';
import { HealthRecord } from '@/types/health-records.types';

const HealthRecordsPage = () => {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const handleBack = () => {
    router.push(ROUTES.PATIENT.ROOT);
  };

  const handleRecordClick = (recordId: string) => {
    router.push(ROUTES.PATIENT.RECORD_DETAILS(recordId));
  };

  // TODO: Fetch health records using patientId
  // For now, using mock data
  const healthRecords: HealthRecord[] = [
    {
      id: '1',
      patientName: 'Kwabena Sarfo',
      date: 'Dec 4, 2025',
    },
    {
      id: '2',
      patientName: 'Kwabena Sarfo',
      date: 'Dec 4, 2025',
    },
    {
      id: '3',
      patientName: 'Kwabena Sarfo',
      date: 'Dec 4, 2025',
    },
    {
      id: '4',
      patientName: 'Kwabena Sarfo',
      date: 'Dec 4, 2025',
    },
  ];

  return (
    <div className="flex flex-col gap-[15px] items-start pt-4 sm:pt-10 px-4 sm:px-0 w-full max-w-[900px] mx-auto">
      <BackButton onClick={handleBack} />

      <div className="flex flex-col gap-5 items-start w-full">
        <h1 className="font-bold leading-[1.2] text-(--text-primary)   text-[20px] sm:text-[24px]">
          Health Records
        </h1>

        <HealthRecordsList
          records={healthRecords}
          onRecordClick={handleRecordClick}
        />
      </div>
    </div>
  );
};

export default HealthRecordsPage;
