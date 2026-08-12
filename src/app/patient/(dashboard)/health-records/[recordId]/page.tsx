'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { Calendar } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import BackButton from '@/components/dashboard/back-button';
import VitalsSummary from '@/components/dashboard/vitals-summary';
import SOAPSection from '@/components/dashboard/soap-section';
import { HealthRecordDetails } from '@/types/health-records.types';

const HealthRecordDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const recordId = params.recordId as string;

  const handleBack = () => {
    router.push(ROUTES.PATIENT.HEALTH_RECORDS);
  };

  // TODO: Fetch health record details using patientId and recordId
  // For now, using mock data
  const recordDetails: HealthRecordDetails = {
    id: recordId,
    date: 'Dec 4, 2025',
    vitals: {
      heartRate: '72 bpm',
      bloodPressure: '120/80',
      temperature: '98.6°F',
      oxygen: '98%',
    },
    soapNote: {
      subjective:
        'Patient reports mild, persistent headaches over the past 3 days. Pain is described as dull and located bilaterally in the temporal region. Rates pain as 4/10. No associated nausea, vomiting, or visual disturbances. Patient has been under increased work stress. Sleep pattern has been irregular (5-6 hours per night). Denies fever, neck stiffness, or neurological symptoms.',
      objective:
        'Vitals: BP 120/80, HR 72, Temp 98.6°F, O2 Sat 98%, RR 16. Alert and oriented x3. Neurological exam: Cranial nerves II-XII intact. No focal deficits. PERRLA. No neck stiffness or meningeal signs. Scalp and cranial palpation reveal mild tension in temporal muscles bilaterally.',
      assessment:
        'Vitals: BP 120/80, HR 72, Temp 98.6°F, O2 Sat 98%, RR 16. Alert and oriented x3. Neurological exam: Cranial nerves II-XII intact. No focal deficits. PERRLA. No neck stiffness or meningeal signs. Scalp and cranial palpation reveal mild tension in temporal muscles bilaterally.',
      plan: [
        '1. Recommend stress reduction techniques and relaxation exercises',
        '2. Improve sleep hygiene - aim for 7-8 hours nightly',
        '3. Adequate hydration - 8 glasses of water daily',
        '4. OTC acetaminophen 500mg as needed for pain (max 3g/day)',
        '5. Follow up in 2 weeks if symptoms persist or worsen',
        '6. Return immediately if develops fever, neck stiffness, vision changes, or severe sudden onset headache',
      ],
    },
  };

  return (
    <div className="flex flex-col gap-[15px] items-start pt-4 sm:pt-10 px-4 sm:px-0 w-full max-w-[900px] mx-auto">
      <BackButton onClick={handleBack} />

      <div className="flex flex-col gap-5 items-start w-full">
        <div className="flex flex-col  gap-2 sm:gap-5 w-full">
          <h1 className="font-bold leading-[1.2] text-(--text-primary) text-[20px] sm:text-[24px]">
            Health Records
          </h1>
          <div className="flex gap-[5px] items-center">
            <Calendar className="w-[18px] h-[18px] text-(--text-primary)" />
            <p className="font-normal leading-[1.2] text-(--text-primary) text-[14px]">
              {recordDetails.date}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-[11px] items-start w-full">
          <VitalsSummary vitals={recordDetails.vitals} />

          <div className="flex flex-col gap-5 items-start w-full">
            <SOAPSection
              type="subjective"
              title="Subjective"
              description="Patient's description of the problem"
              content={recordDetails.soapNote.subjective}
            />

            <SOAPSection
              type="objective"
              title="Objective"
              description="Clinical findings and measurements"
              content={recordDetails.soapNote.objective}
            />

            <SOAPSection
              type="assessment"
              title="Assessment"
              description="The clinician analyzes the subjective and objective data to determine what's going on."
              content={recordDetails.soapNote.assessment}
            />

            <SOAPSection
              type="plan"
              title="Plan"
              description="Treatment plan and follow-up"
              content={recordDetails.soapNote.plan}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRecordDetailsPage;
