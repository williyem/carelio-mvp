import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { StaffRole } from '@/stores/staff-profile-store';
import {
  agreementsToPlainText,
  getStaffAgreements,
} from '@/lib/legal/carelio-agreements';

export async function buildProviderAgreementPdf({
  name,
  role,
  clinicName,
  signatureDataUrl,
}: {
  name: string;
  role: StaffRole;
  clinicName?: string;
  signatureDataUrl: string;
}): Promise<string> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const header = [
    'Carelio Provider Agreement',
    '',
    `Role: ${role === 'doctor' ? 'Physician' : 'Health Assistant'}`,
    clinicName ? `Practice / facility: ${clinicName}` : '',
    `Signed electronically by ${name} on ${new Date().toLocaleDateString()}.`,
    '',
  ]
    .filter((line, index, arr) => line !== '' || arr[index - 1] !== '')
    .join('\n');

  const body = `${header}\n${agreementsToPlainText(getStaffAgreements(role))}`;
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
      /^\d+\.\s/.test(line) || line === 'Carelio Provider Agreement';
    if (line === 'Carelio Provider Agreement') {
      drawLine(line, true);
      y -= 4;
      continue;
    }
    drawLine(line, isHeading);
  }

  if (signatureDataUrl.startsWith('data:image')) {
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

  const bytes = await pdf.save();
  const blob = new Blob([bytes.buffer as ArrayBuffer], {
    type: 'application/pdf',
  });
  return URL.createObjectURL(blob);
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
