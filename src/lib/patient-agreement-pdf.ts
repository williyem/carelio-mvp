import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {
  agreementsToPlainText,
  getPatientAgreements,
} from '@/lib/legal/carelio-agreements';

export type PatientAgreementPdfInput = {
  name: string;
  date?: string;
  phone?: string;
  email?: string;
  address?: string;
  insuranceCompany?: string;
  memberId?: string;
  signatureDataUrl?: string;
};

async function buildPatientAgreementDocument({
  name,
  date,
  phone,
  email,
  address,
  insuranceCompany,
  memberId,
  signatureDataUrl,
}: PatientAgreementPdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const signedDate = date || new Date().toLocaleDateString();
  const header = [
    'Carelio Patient Agreement',
    '',
    `Patient: ${name}`,
    phone ? `Phone: ${phone}` : '',
    email ? `Email: ${email}` : '',
    address ? `Address: ${address}` : '',
    insuranceCompany
      ? `NHIS / scheme: ${insuranceCompany}${memberId ? ` (${memberId})` : ''}`
      : '',
    `Signed electronically on ${signedDate}.`,
    '',
  ]
    .filter((line, index, arr) => line !== '' || arr[index - 1] !== '')
    .join('\n');

  const body = `${header}\n${agreementsToPlainText(getPatientAgreements())}`;
  const lines = wrapText(body, 88);

  let page = pdf.addPage([612, 792]);
  let y = 740;

  const drawLine = (text: string, useBold = false) => {
    if (y < 56) {
      page = pdf.addPage([612, 792]);
      y = 740;
    }
    page.drawText(text, {
      x: 48,
      y,
      size: useBold ? 12 : 10,
      font: useBold ? bold : font,
      color: rgb(0.12, 0.12, 0.12),
    });
    y -= useBold ? 18 : 14;
  };

  for (const line of lines) {
    const isHeading =
      /^\d+\.\s/.test(line) || line === 'Carelio Patient Agreement';
    if (line === 'Carelio Patient Agreement') {
      drawLine(line, true);
      y -= 4;
      continue;
    }
    drawLine(line, isHeading);
  }

  if (signatureDataUrl?.startsWith('data:image')) {
    if (y < 120) {
      page = pdf.addPage([612, 792]);
      y = 740;
    }
    const base64 = signatureDataUrl.split(',')[1];
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const image = await pdf.embedPng(bytes);
    page.drawText('Signature:', {
      x: 48,
      y: y - 12,
      size: 10,
      font: bold,
      color: rgb(0.12, 0.12, 0.12),
    });
    page.drawImage(image, { x: 48, y: y - 80, width: 180, height: 48 });
  }

  return pdf.save();
}

export async function buildPatientAgreementPdf(
  input: PatientAgreementPdfInput
): Promise<string> {
  const bytes = await buildPatientAgreementDocument(input);
  const blob = new Blob([bytes.buffer as ArrayBuffer], {
    type: 'application/pdf',
  });
  return URL.createObjectURL(blob);
}

export async function buildPatientAgreementTemplatePdf(
  input: Omit<PatientAgreementPdfInput, 'signatureDataUrl'>
): Promise<string> {
  return buildPatientAgreementPdf({ ...input, signatureDataUrl: undefined });
}

export async function buildPatientAgreementFiles(
  input: PatientAgreementPdfInput
) {
  const signedBytes = await buildPatientAgreementDocument(input);
  const templateBytes = await buildPatientAgreementDocument({
    ...input,
    signatureDataUrl: undefined,
  });

  const signed = new File(
    [signedBytes.buffer as ArrayBuffer],
    `carelio-patient-agreement-${slugify(input.name)}.pdf`,
    { type: 'application/pdf' }
  );
  const template = new File(
    [templateBytes.buffer as ArrayBuffer],
    'carelio-patient-agreement-template.pdf',
    { type: 'application/pdf' }
  );

  return { signed, template };
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-') || 'patient';
}

function wrapText(text: string, width: number): string[] {
  const out: string[] = [];
  for (const paragraph of text.split('\n')) {
    if (!paragraph) {
      out.push('');
      continue;
    }
    const words = paragraph.split(' ');
    let line = '';
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > width) {
        out.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) out.push(line);
  }
  return out;
}
