'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { ROUTES } from '@/lib/routes';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PatientTab } from '@/types/patient.types';
import BackButton from '@/components/dashboard/back-button';
import PatientDetailsHeader from '@/components/dashboard/patient-details-header';
import PatientInfoCard from '@/components/dashboard/patient-info-card';
import PatientInfoCardSkeleton from '@/components/dashboard/patient-info-card-skeleton';
import AppointmentsList from '@/components/dashboard/appointments-list';
import HIERecordsList from '@/components/dashboard/hie-records-list';
import useGetPatientByIdQuery from '@/integration/patient/queries/useGetPatientById';
import { formatDateOfBirth, genderMap } from '@/lib/easy';
import { Info } from 'lucide-react';

const PatientDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const [activeTab, setActiveTab] = useState<PatientTab>('appointments');

  const { patient: fetchedPatient, isLoading: isPatientLoading } =
    useGetPatientByIdQuery(patientId, 'health-assistant');

  const handleBack = () => {
    router.push(ROUTES.HEALTH_ASSISTANT.PATIENT.ROOT);
  };

  const patient = useMemo(() => {
    if (!fetchedPatient) {
      return {
        id: '',
        patientId: patientId || '',
        name: '',
        dateOfBirth: '',
        gender: 'Other' as const,
        bloodType: '',
        email: '',
        phone: '',
        address: '',
        isRegistrationComplete: false,
      };
    }

    return {
      id: fetchedPatient.id,
      name: fetchedPatient.fullName,
      patientId: fetchedPatient.patientId,
      dateOfBirth: formatDateOfBirth(fetchedPatient.dob),
      gender: genderMap[fetchedPatient.gender] || 'Other',
      bloodType: fetchedPatient.bloodType,
      email: fetchedPatient.email,
      phone: fetchedPatient.phoneNumber,
      address: fetchedPatient.address,
      isRegistrationComplete: fetchedPatient.isRegistrationComplete,
    };
  }, [fetchedPatient, patientId]);

  // const hieRecords = [
  //   {
  //     id: '1',
  //     hospitalName: 'Boston General Hospital',
  //     date: 'Dec 12, 2025',
  //     department: 'Emergency Department',
  //     provider: 'Dr. Jennifer Martinez',
  //     diagnosis: 'Migraine without aura',
  //     summary:
  //       'Patient presented to ED with severe headache. CT scan negative. Treated with IV fluids and pain medication. Discharged home with follow-up instructions.',
  //   },
  //   {
  //     id: '2',
  //     hospitalName: 'Cambridge Medical Center',
  //     date: 'Dec 12, 2025',
  //     department: 'Primary Care',
  //     provider: 'Dr. Robert Thompson',
  //     diagnosis: 'Annual wellness visit',
  //     summary:
  //       'Routine annual physical exam. All vitals within normal limits. Preventive care counseling provided. No acute concerns.',
  //   },
  // ];

  return (
    <div className="flex flex-col gap-5 items-start w-[900px] max-w-full mx-auto">
      <BackButton onClick={handleBack} />
      <PatientDetailsHeader
        patientId={patient.id}
        patient={patient}
        portal="health-assistant"
      />
      {/* Incomplete Profile Banner */}
      {!isPatientLoading && !patient?.isRegistrationComplete && (
        <div className="bg-[#FDFAE7] w-full my-2 border border-[#FFE0A3] rounded-2xl p-5 flex items-center gap-4 text-gray-900 animate-in fade-in slide-in-from-top-4 duration-500">
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

      {isPatientLoading ? (
        <PatientInfoCardSkeleton />
      ) : (
        <PatientInfoCard patient={patient} />
      )}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as PatientTab)}
        className="w-full"
      >
        <TabsList className="bg-(--bg-primary) h-[57px] p-[5px] rounded-[100px] w-[340px] max-sm:w-auto">
          <TabsTrigger
            value="appointments"
            className="flex-1 h-full  text-[12px] md:text-[14px] px-2 md:px-3 font-medium leading-[1.2]"
          >
            Appointments
          </TabsTrigger>
          <TabsTrigger
            value="hie-records"
            className="flex-1     font-medium leading-[1.2] text-[12px] md:text-[14px] px-2 md:px-3"
          >
            HIE Records
          </TabsTrigger>
        </TabsList>
        <TabsContent value="appointments" className="mt-5 w-full">
          <AppointmentsList patient={patient} portal="health-assistant" />
        </TabsContent>
        <TabsContent value="hie-records" className="mt-5 w-full">
          <HIERecordsList records={[]} isLoading={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDetailsPage;
