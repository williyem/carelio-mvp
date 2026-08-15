'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ConsentFormWrapper } from './ConsentFormWrapper';
import { ConsentSignRow } from './consent-sign-row';
import { usePatientInviteStore } from '@/stores/patient-invite-store';
import { PATIENT_AGREEMENT_SNIPPETS } from '@/lib/legal/carelio-agreements';
import { generateSignatureImage } from '@/lib/signatureGenerator';
import { toast } from 'sonner';

const SECTIONS = [
  {
    title: '1. Consent to treat',
    paragraphs: [...PATIENT_AGREEMENT_SNIPPETS.consentToTreat],
    bullets: [...PATIENT_AGREEMENT_SNIPPETS.consentToTreatBullets],
  },
  {
    title: '2. Telehealth & remote devices',
    paragraphs: [
      'I consent to receive care through telehealth, including video, audio, chat, and remote monitoring. I authorize the use of remote diagnostic devices such as Bluetooth stethoscopes, otoscopes, and other clinician-approved tools used on Carelio.',
      'I understand telehealth has risks (including technical failures), that data is transmitted in encrypted form, that health assistants may operate equipment under supervision without interpreting medical information, and that sessions are recorded only when disclosed.',
    ],
  },
  {
    title: '3. Privacy practices',
    paragraphs: [
      `${PATIENT_AGREEMENT_SNIPPETS.privacyPracticesTitle}. Carelio protects your personal and health information under Ghana’s Data Protection Act, 2012 (Act 843). You may request access or corrections, ask about who on your care team can view your chart, and choose confidential communication options where available.`,
      'We may use or disclose information for treatment, payment, healthcare operations, NHIS or private scheme claims, care coordination, and when required by Ghanaian law.',
    ],
  },
  {
    title: '4. Release of information',
    paragraphs: [PATIENT_AGREEMENT_SNIPPETS.releaseOfInformation],
  },
  {
    title: '5. Minors (if applicable)',
    paragraphs: [
      'If the patient is a minor, a parent or legal guardian provides consent unless limited by Ghanaian law. Some services may remain confidential for minors where the law permits.',
    ],
  },
  {
    title: '6. Acknowledgment',
    paragraphs: [PATIENT_AGREEMENT_SNIPPETS.finalAcknowledgment],
  },
];

export default function PatientAgreementsStep({
  onContinue,
}: {
  onContinue?: () => void;
}) {
  const { formData, updateFormData, nextStep } = usePatientInviteStore();
  const [printedName, setPrintedName] = useState(
    formData.printedName || formData.fullName || ''
  );
  const [agreed, setAgreed] = useState(false);
  const today = new Date().toLocaleDateString('en-CA');

  const signaturePreview = useMemo(() => {
    if (!agreed || !printedName.trim()) return '';
    return generateSignatureImage(printedName.trim());
  }, [agreed, printedName]);

  const handleNext = () => {
    if (!agreed || !printedName.trim()) {
      toast.error('Enter your printed name and agree to sign');
      return;
    }
    const signature = generateSignatureImage(printedName.trim());
    updateFormData({
      printedName: printedName.trim(),
      fullName: printedName.trim() || formData.fullName,
      patientInitials: printedName
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .toUpperCase(),
      patientSignature: signature,
      finalSignatureName: printedName.trim(),
      date: today,
    });
    if (onContinue) onContinue();
    else nextStep();
  };

  return (
    <ConsentFormWrapper
      title="Patient agreements"
      description="Review Carelio’s Ghana telehealth terms, then sign electronically."
      onNext={handleNext}
      nextDisabled={!agreed || !printedName.trim()}
      nextLabel="Agree and continue"
    >
      <div className="max-h-[360px] overflow-y-auto rounded-[8px] border border-(--border-stroke) p-4 space-y-5 text-[14px] leading-relaxed text-text-strong-950 text-left">
        {SECTIONS.map((section) => (
          <div key={section.title} className="space-y-2">
            <p className="font-semibold">{section.title}</p>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            {'bullets' in section && section.bullets ? (
              <ul className="list-disc pl-5 space-y-1">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>

      <ConsentSignRow
        mode="printedName"
        printedNameId="patient-printed-name"
        printedNameValue={printedName}
        onPrintedNameChange={setPrintedName}
        dateValue={today}
      />

      <div className="flex items-start space-x-2 text-left">
        <Checkbox
          id="patient-agreements"
          checked={agreed}
          onCheckedChange={(checked) => setAgreed(Boolean(checked))}
          className="size-4 mt-0.5"
        />
        <Label
          htmlFor="patient-agreements"
          className="typography-paragraph-small text-text-strong-950 leading-normal cursor-pointer font-normal"
        >
          I have read and agree to the Carelio terms above, and I electronically
          sign using my printed name
        </Label>
      </div>

      {signaturePreview ? (
        <div className="text-left space-y-1">
          <p className="text-sm text-text-sub-600">Signature preview</p>
          <div className="border-b-2 border-dotted border-(--border-gray) max-w-[300px] h-[60px] flex items-center">
            <Image
              src={signaturePreview}
              alt="Signature preview"
              width={300}
              height={60}
              className="h-[60px] w-full object-contain"
            />
          </div>
        </div>
      ) : null}
    </ConsentFormWrapper>
  );
}
