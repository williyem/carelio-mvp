export type AgreementRole = 'doctor' | 'health-assistant' | 'patient';

export type AgreementSection = {
  title: string;
  paragraphs: string[];
};

export const DOCTOR_AGREEMENTS: AgreementSection[] = [
  {
    title: '1. Carelio Platform Terms of Use',
    paragraphs: [
      'By signing below, I agree to use the Carelio telehealth platform only for lawful clinical purposes in Ghana and in accordance with applicable professional and licensing rules, including requirements of the Medical and Dental Council (MDC) or other relevant regulatory body for my profession.',
      'I will keep my login credentials confidential, not share my account, and promptly notify Carelio support if I suspect unauthorized access.',
      'I understand that Carelio provides software and facilitation services and does not practise medicine on my behalf.',
    ],
  },
  {
    title: '2. Confidentiality and Data Protection Obligations',
    paragraphs: [
      'I agree to protect all patient health information accessed through Carelio and to use or disclose it only for treatment, payment, healthcare operations, or as otherwise required by Ghanaian law, including the Data Protection Act, 2012 (Act 843).',
      'I will not download, copy, or redistribute patient data outside approved clinical workflows except where required for continuity of care or legal compliance.',
      'I will report suspected privacy or security incidents related to Carelio use without unreasonable delay.',
    ],
  },
  {
    title: '3. Telehealth Practice Standards',
    paragraphs: [
      'I will obtain informed consent (or confirm it has been obtained) before providing telehealth care, and I will document clinical encounters in the patient record.',
      'I will verify patient identity to a reasonable clinical standard, assess suitability for remote care, and escalate to in-person care or emergency services (including dialling 112 where appropriate) when clinically indicated.',
      'I understand that technology failures may interrupt a visit and that I remain responsible for arranging appropriate follow-up when care cannot be completed safely online.',
    ],
  },
  {
    title: '4. Acceptable Use of Patient Data and Recordings',
    paragraphs: [
      'I will not record video or audio consultations outside Carelio-approved features, and I will not use patient images, vitals, or notes for marketing, training of third parties, or any non-care purpose without proper authorization.',
      'Consultation notes, vitals, and related records entered in Carelio form part of the clinical record and must be accurate to the best of my knowledge.',
    ],
  },
];

export const HEALTH_ASSISTANT_AGREEMENTS: AgreementSection[] = [
  {
    title: '1. Carelio Platform Terms of Use',
    paragraphs: [
      'By signing below, I agree to use Carelio only to support licensed clinicians and patients within my assigned duties in Ghana.',
      'I will keep my credentials confidential and will not allow others to use my account.',
    ],
  },
  {
    title: '2. Confidentiality and Subordinate Duties',
    paragraphs: [
      'I agree to protect patient health information under Ghana’s Data Protection Act, 2012 (Act 843), and to access charts, appointments, and vitals only as needed to perform assigned tasks.',
      'I will follow clinician direction for patient outreach, scheduling, and documentation support, and I will not disclose patient information outside approved Carelio workflows.',
    ],
  },
  {
    title: '3. Device and Vitals Handling Acknowledgement',
    paragraphs: [
      'I understand that I may connect approved devices and capture vital signs for the care team, but I do not diagnose, prescribe, or independently determine treatment.',
      'I will follow device instructions and tutorial guidance, enter readings accurately, and flag abnormal or uncertain readings to the supervising clinician.',
      'I will not fabricate device readings or bypass confirmation steps when a reading appears incomplete or incorrect.',
    ],
  },
  {
    title: '4. Acceptable Use',
    paragraphs: [
      'I will not record or redistribute patient sessions, images, or data outside Carelio-approved clinical use.',
      'I will report privacy, safety, or device issues promptly to my supervising clinician or Carelio support.',
    ],
  },
];

export const PATIENT_AGREEMENT_SNIPPETS = {
  privacyPracticesTitle: 'How Carelio protects your information',
  consentToTreat: [
    'I voluntarily consent to routine medical and related health services provided through Carelio in Ghana, including examinations, diagnosis, treatment, and the use of telehealth or remote diagnostic tools.',
    'I understand that:',
  ],
  consentToTreatBullets: [
    'Providers or supervising clinicians may be in another city or region within Ghana, or elsewhere when clearly disclosed.',
    'Trained health assistants may assist under licensed provider supervision.',
    'I may refuse or withdraw consent at any time.',
  ],
  releaseOfInformation:
    'I authorize Carelio to release information for treatment, billing, NHIS or private scheme claims, and care coordination to my treating clinician and assigned health assistants on the Carelio care team.',
  financialResponsibility: [
    'I authorize Carelio (or my clinician’s practice using Carelio) to bill the National Health Insurance Scheme (NHIS), my private health scheme, or collect applicable fees for services provided.',
    'I agree to keep my contact and coverage information current and to notify Carelio or my care team of any changes. I remain responsible for any fees not covered by NHIS or my scheme.',
  ],
  finalAcknowledgment:
    'I acknowledge that I have read and agree to Carelio’s privacy practices, telehealth consent, and related terms for care delivered in Ghana, and that care may be delivered by Carelio-affiliated providers.',
} as const;

export const PATIENT_AGREEMENTS: AgreementSection[] = [
  {
    title: '1. Consent to treat',
    paragraphs: [
      PATIENT_AGREEMENT_SNIPPETS.consentToTreat[0],
      `${PATIENT_AGREEMENT_SNIPPETS.consentToTreat[1]} ${PATIENT_AGREEMENT_SNIPPETS.consentToTreatBullets.join(' ')}`,
    ],
  },
  {
    title: '2. Telehealth and remote devices',
    paragraphs: [
      'I consent to receive care through telehealth, including video, audio, chat, and remote monitoring. I authorize the use of clinician-approved remote diagnostic devices on Carelio.',
      'I understand telehealth has risks including technical failures, that data is transmitted in encrypted form, and that health assistants may operate equipment under supervision without interpreting medical information.',
    ],
  },
  {
    title: '3. Privacy practices',
    paragraphs: [
      `${PATIENT_AGREEMENT_SNIPPETS.privacyPracticesTitle}. Carelio protects your personal and health information under Ghana’s Data Protection Act, 2012 (Act 843).`,
      'We may use or disclose information for treatment, payment, healthcare operations, NHIS or private scheme claims, care coordination, and when required by Ghanaian law.',
    ],
  },
  {
    title: '4. Release of information',
    paragraphs: [PATIENT_AGREEMENT_SNIPPETS.releaseOfInformation],
  },
  {
    title: '5. Financial responsibility',
    paragraphs: [...PATIENT_AGREEMENT_SNIPPETS.financialResponsibility],
  },
  {
    title: '6. Acknowledgment',
    paragraphs: [PATIENT_AGREEMENT_SNIPPETS.finalAcknowledgment],
  },
];

export function getStaffAgreements(
  role: 'doctor' | 'health-assistant'
): AgreementSection[] {
  return role === 'doctor' ? DOCTOR_AGREEMENTS : HEALTH_ASSISTANT_AGREEMENTS;
}

export function getPatientAgreements(): AgreementSection[] {
  return PATIENT_AGREEMENTS;
}

export function agreementsToPlainText(sections: AgreementSection[]): string {
  return sections
    .map((section) => `${section.title}\n\n${section.paragraphs.join('\n\n')}`)
    .join('\n\n');
}
