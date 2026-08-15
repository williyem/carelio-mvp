export const SOAP_SECTION_COPY = {
  subjective: {
    title: 'Subjective',
    description: "Patient's description of the problem",
  },
  objective: {
    title: 'Objective',
    description: 'Clinical findings and measurements',
  },
  assessment: {
    title: 'Assessment',
    description:
      'The clinician analyzes the subjective and objective data to determine what is going on.',
  },
  plan: {
    title: 'Plan',
    description: 'Treatment plan and follow-up',
  },
} as const;

export type SoapSectionType = keyof typeof SOAP_SECTION_COPY;

export const SOAP_SECTION_KEYS = Object.keys(
  SOAP_SECTION_COPY
) as SoapSectionType[];

export function soapPlainText(value?: string | string[] | null) {
  const raw = Array.isArray(value) ? value.join(' ') : (value ?? '');
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function hasSoapContent(value?: string | string[] | null) {
  return soapPlainText(value).length > 0;
}
